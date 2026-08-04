import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { OrderService } from '../order/order.service';
import { PrintifyService } from '../printify/printify.service';
import { PrintfulService } from '../printful/printful.service';
import { StripeService } from './stripe.service';
import { AuditService } from '../../common/audit/audit.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        private readonly orderService: OrderService,
        private readonly printify: PrintifyService,
        private readonly printful: PrintfulService,
        private readonly stripe: StripeService,
        private readonly audit: AuditService,
    ) { }

    // STEP 1 — authorize. Prices the cart from Printify, creates a Stripe
    // authorization hold (manual capture), and records the Order + Payment
    // atomically. Returns the client secret for the browser to confirm.
    async start(userId: string, dto: CheckoutDto) {
        const printifyItems = dto.items.filter(i => !i.productId.startsWith('printful-'));
        const printfulItems = dto.items.filter(i => i.productId.startsWith('printful-'));

        let printifyPriced = { lines: [] as any[], subtotalCents: 0 };
        let printfulPriced = { lines: [] as any[], subtotalCents: 0 };

        if (printifyItems.length > 0) {
            printifyPriced = await this.printify.priceOrder(printifyItems);
        }
        if (printfulItems.length > 0) {
            printfulPriced = await this.printful.priceOrder(printfulItems);
        }

        const printifyAddress = dto.shipping ? {
            first_name: dto.shipping.firstName || 'Valued',
            last_name: dto.shipping.lastName || 'Customer',
            email: dto.shipping.email,
            country: dto.shipping.country,
            region: dto.shipping.region,
            address1: dto.shipping.address1,
            address2: dto.shipping.address2 || undefined,
            city: dto.shipping.city,
            zip: dto.shipping.zip,
            phone: '',
        } : undefined;

        let shippingCents = 0;
        if (printifyAddress) {
            if (printifyItems.length > 0) {
                shippingCents += await this.printify.calculateShippingCost(
                    printifyItems.map((i) => ({ product_id: i.productId, variant_id: i.variantId, quantity: i.quantity })),
                    printifyAddress,
                );
            }
            if (printfulItems.length > 0) {
                shippingCents += await this.printful.calculateShippingCost(
                    printfulItems.map((i) => ({ product_id: i.productId, variant_id: i.variantId, quantity: i.quantity })),
                    printifyAddress,
                );
            }
        }

        const currency = process.env.STORE_CURRENCY || 'USD';
        const subtotalCents = printifyPriced.subtotalCents + printfulPriced.subtotalCents;
        const totalCents = subtotalCents + shippingCents;
        if (totalCents <= 0) throw new BadRequestException('Cart total is zero.');

        const intent = await this.stripe.createPaymentIntent({
            amountCents: totalCents,
            currency,
            metadata: { userId },
            shipping: dto.shipping ? {
                name: `${dto.shipping.firstName || ''} ${dto.shipping.lastName || ''}`.trim() || 'Customer',
                address: {
                    line1: dto.shipping.address1,
                    line2: dto.shipping.address2 || undefined,
                    city: dto.shipping.city,
                    state: dto.shipping.region,
                    postal_code: dto.shipping.zip,
                    country: dto.shipping.country,
                },
            } : undefined,
        });

        const session = await this.connection.startSession();
        let orderId = '';
        try {
            await session.withTransaction(async () => {
                const allLines = [
                    ...printifyPriced.lines.map(l => ({ ...l, provider: 'printify' })),
                    ...printfulPriced.lines.map(l => ({
                        printifyProductId: l.printfulProductId,
                        printifyVariantId: l.printfulVariantId,
                        quantity: l.quantity,
                        unitPriceCents: l.unitPriceCents,
                        name: l.name,
                        variantLabel: l.variantLabel,
                        image: l.image,
                        provider: 'printful',
                    })),
                ];

                const order = await this.orderService.create(
                    {
                        userId,
                        items: allLines,
                        subtotalCents,
                        shippingCents,
                        totalCents,
                        currency,
                        shippingAddress: dto.shipping,
                    },
                    session,
                );
                order.stripePaymentIntentId = intent.id;
                order.paymentStatus = 'authorized';
                await order.save({ session });
                orderId = order._id.toString();

                await this.paymentModel.create(
                    [{
                        orderId: order._id,
                        stripePaymentIntentId: intent.id,
                        amountCents: totalCents,
                        currency,
                        status: 'requires_capture',
                    }],
                    { session },
                );
            });
        } finally {
            await session.endSession();
        }

        await this.audit.log({
            action: 'checkout.started',
            message: `Checkout started for order ${orderId} (${totalCents} ${currency})`,
            orderId,
            userId,
            meta: { paymentIntentId: intent.id, totalCents, currency },
        });

        return { orderId, clientSecret: intent.client_secret, amountCents: totalCents, shippingCents, currency };
    }

    // STEP 2 — confirm (browser path). Delegates to the shared, idempotent
    // fulfillment routine after verifying ownership.
    async confirm(userId: string, orderId: string) {
        const order = await this.orderModel.findOne({ _id: orderId, userId });
        if (!order) throw new NotFoundException('Order not found');
        return this.fulfillOrder(order);
    }

    // Webhook path — fulfill by payment intent (no user context).
    async fulfillByPaymentIntent(paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!order) return null;
        return this.fulfillOrder(order);
    }

    // Shared, IDEMPOTENT fulfillment. Called by BOTH the confirm endpoint and
    // the Stripe webhook, so an order completes even if the browser closed.
    // Money-safe sequence: create Printify order → capture → (optional) produce.
    // If Printify fails before capture, the hold is canceled (no charge).
    async fulfillOrder(order: OrderDocument) {
        if (!order.stripePaymentIntentId) throw new BadRequestException('Order has no payment.');

        // Already fulfilled → no-op (idempotent).
        if (['in_production', 'shipped', 'delivered'].includes(order.orderStatus)) {
            return order;
        }
        if (['failed', 'canceled', 'refunded'].includes(order.orderStatus)) {
            throw new BadRequestException('This order can no longer be completed.');
        }

        const pi = await this.stripe.retrievePaymentIntent(order.stripePaymentIntentId);
        if (pi.status !== 'requires_capture') {
            throw new BadRequestException(`Payment not authorized (status: ${pi.status}).`);
        }

        const orderId = order._id.toString();
        const userId = order.userId.toString();
        const addr = order.shippingAddress;
        try {
            const printifyItems = order.items.filter(i => i.provider !== 'printful');
            const printfulItems = order.items.filter(i => i.provider === 'printful');
            let createdPrintifyOrderId: string | undefined;
            let createdPrintfulOrderId: string | undefined;

            // 1) Create the supplier orders (does NOT charge yet).
            if (printifyItems.length > 0) {
                const printifyOrder = await this.printify.createOrder({
                    external_id: orderId,
                    label: `VAID ${orderId}`,
                    line_items: printifyItems.map((i) => ({
                        product_id: i.printifyProductId,
                        variant_id: i.printifyVariantId,
                        quantity: i.quantity,
                    })),
                    address_to: {
                        first_name: addr.firstName,
                        last_name: addr.lastName,
                        email: addr.email,
                        phone: addr.phone,
                        country: addr.country,
                        region: addr.region,
                        address1: addr.address1,
                        address2: addr.address2 || '',
                        city: addr.city,
                        zip: addr.zip,
                    },
                });
                createdPrintifyOrderId = printifyOrder.id;
            }

            if (printfulItems.length > 0) {
                const printfulOrder = await this.printful.createOrder({
                    external_id: orderId,
                    recipient: {
                        name: `${addr.firstName} ${addr.lastName}`.trim(),
                        email: addr.email,
                        phone: addr.phone,
                        country_code: addr.country,
                        state_code: addr.region,
                        address1: addr.address1,
                        address2: addr.address2 || '',
                        city: addr.city,
                        zipcode: addr.zip,
                    },
                    items: printfulItems.map((i) => ({
                        sync_variant_id: i.printifyVariantId,
                        quantity: i.quantity,
                    })),
                });
                createdPrintfulOrderId = printfulOrder.id;
            }

            // 2) Capture the customer's money.
            await this.stripe.capture(pi.id);

            if (createdPrintifyOrderId) order.printifyOrderId = createdPrintifyOrderId;
            if (createdPrintfulOrderId) order.printfulOrderId = createdPrintfulOrderId;
            order.orderStatus = 'in_production';
            order.paymentStatus = 'captured';
            await order.save();
            await this.paymentModel.updateOne(
                { stripePaymentIntentId: pi.id },
                { $set: { status: 'captured', capturedAt: new Date() } },
            );

            // 3) Optionally push to production.
            let autoFulfilled = false;
            if (process.env.PRINTIFY_AUTO_FULFILL === 'true') {
                if (createdPrintifyOrderId) await this.printify.sendToProduction(createdPrintifyOrderId);
                if (createdPrintfulOrderId) await this.printful.sendToProduction(createdPrintfulOrderId);
                autoFulfilled = true;
            }

            await this.audit.log({
                action: 'checkout.completed',
                message: `Order ${orderId} captured + sent to suppliers${autoFulfilled ? ' (production)' : ''}`,
                orderId, userId,
                meta: { printifyOrderId: createdPrintifyOrderId, printfulOrderId: createdPrintfulOrderId, paymentIntentId: pi.id, autoFulfilled },
            });
            return order;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Fulfillment failed';
            // Failed BEFORE capture → release the hold, no charge.
            try { await this.stripe.cancel(pi.id); } catch { /* already gone */ }
            order.orderStatus = 'failed';
            order.paymentStatus = 'failed';
            order.note = message.slice(0, 500);
            await order.save();
            await this.paymentModel.updateOne(
                { stripePaymentIntentId: pi.id },
                { $set: { status: 'canceled' } },
            );
            await this.audit.log({
                action: 'checkout.failed',
                level: 'error',
                message: `Order ${orderId} fulfillment failed; hold released (no charge): ${message}`,
                orderId, userId,
            });
            throw new BadRequestException(
                'We could not place your order with the manufacturer. You have NOT been charged.',
            );
        }
    }

    // Stripe: authorization canceled/expired → release the order (no charge).
    async handlePaymentCanceled(paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!order || order.paymentStatus === 'captured') return;
        order.orderStatus = 'canceled';
        order.paymentStatus = 'failed';
        await order.save();
        await this.paymentModel.updateOne(
            { stripePaymentIntentId: paymentIntentId }, { $set: { status: 'canceled' } },
        );
        await this.audit.log({
            action: 'payment.canceled',
            message: `Order ${order._id} canceled (PI ${paymentIntentId})`,
            orderId: order._id.toString(),
        });
    }

    // Stripe: payment failed → mark failed (no charge).
    async handlePaymentFailed(paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!order || order.paymentStatus === 'captured') return;
        order.orderStatus = 'failed';
        order.paymentStatus = 'failed';
        await order.save();
        await this.audit.log({
            action: 'payment.failed',
            level: 'warn',
            message: `Order ${order._id} payment failed (PI ${paymentIntentId})`,
            orderId: order._id.toString(),
        });
    }

    // Printify webhook → pull authoritative status + tracking into our order.
    async syncPrintifyOrder(printifyOrderId: string) {
        const order = await this.orderModel.findOne({ printifyOrderId });
        if (!order) return;
        const pf: any = await this.printify.fetchOrder(printifyOrderId);
        const status = String(pf?.status || '').toLowerCase();
        const map: Record<string, OrderDocument['orderStatus']> = {
            'on-hold': 'in_production', 'pending': 'in_production',
            'sending-to-production': 'in_production', 'in-production': 'in_production',
            'ready-to-ship': 'in_production',
            'shipped': 'shipped', 'fulfilled': 'shipped', 'partially-fulfilled': 'shipped',
            'delivered': 'delivered', 'canceled': 'canceled', 'cancelled': 'canceled',
        };
        const mapped = map[status];
        if (mapped && order.orderStatus !== 'delivered') {
            order.orderStatus = mapped;
        }
        const shipments = Array.isArray(pf?.shipments) ? pf.shipments : [];
        if (shipments.length) {
            order.tracking = shipments.map((s: any) => ({
                carrier: s.carrier, number: s.number, url: s.url,
            }));
        }
        await order.save();
        await this.audit.log({
            action: 'printify.synced',
            message: `Order ${order._id} synced from Printify (${status})`,
            orderId: order._id.toString(),
            meta: { printifyStatus: status },
        });
    }
}
