import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Refund, RefundDocument } from './schemas/refund.schema';
import { OrderService } from '../order/order.service';
import { StripeService } from './stripe.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class RefundService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Refund.name) private readonly refundModel: Model<RefundDocument>,
        private readonly orderService: OrderService,
        private readonly stripe: StripeService,
        private readonly audit: AuditService,
    ) { }

    // Admin-issued refund (full or partial). Safe against over-refunding: the
    // amount is capped at the remaining un-refunded balance.
    async refund(adminUserId: string, orderId: string, amountCents?: number, reason?: string) {
        await this.orderService.assertAdmin(adminUserId);

        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');
        if (!order.stripePaymentIntentId) throw new BadRequestException('Order has no payment.');
        if (!['captured', 'partially_refunded'].includes(order.paymentStatus)) {
            throw new BadRequestException('This order has no captured payment to refund.');
        }

        const alreadyRefunded = order.refundedCents || 0;
        const remaining = order.totalCents - alreadyRefunded;
        const amount = amountCents ?? remaining; // default: refund the full remainder
        if (!Number.isInteger(amount) || amount <= 0 || amount > remaining) {
            throw new BadRequestException(
                `Invalid refund amount. Remaining refundable: ${remaining} ${order.currency}.`,
            );
        }

        // Issue the refund on Stripe.
        const stripeRefund = await this.stripe.refund({
            paymentIntentId: order.stripePaymentIntentId,
            amountCents: amount,
            reason,
        });

        // Record it (stripeRefundId is unique → can't double-record).
        await this.refundModel.create({
            orderId: order._id,
            stripePaymentIntentId: order.stripePaymentIntentId,
            stripeRefundId: stripeRefund.id,
            amountCents: amount,
            currency: order.currency,
            reason,
            status: stripeRefund.status === 'succeeded' ? 'succeeded' : 'pending',
            issuedBy: adminUserId,
        });

        // Update the order totals + status.
        const newRefunded = alreadyRefunded + amount;
        order.refundedCents = newRefunded;
        if (newRefunded >= order.totalCents) {
            order.paymentStatus = 'refunded';
            order.orderStatus = 'refunded';
        } else {
            order.paymentStatus = 'partially_refunded';
        }
        await order.save();

        if (order.paymentStatus === 'refunded') {
            await this.paymentModel.updateOne(
                { stripePaymentIntentId: order.stripePaymentIntentId },
                { $set: { status: 'captured' } }, // captured then fully refunded
            );
        }

        await this.audit.log({
            action: 'refund.issued',
            message: `Refund ${amount} ${order.currency} on order ${orderId} by admin ${adminUserId} (total refunded ${newRefunded})`,
            orderId,
            userId: adminUserId,
            meta: { amount, reason, stripeRefundId: stripeRefund.id, newRefunded },
        });

        return order;
    }

    async listForOrder(adminUserId: string, orderId: string) {
        await this.orderService.assertAdmin(adminUserId);
        return this.refundModel.find({ orderId }).sort({ createdAt: -1 });
    }
}
