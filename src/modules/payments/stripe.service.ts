import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { requireEnv } from '../../common/config/env';

@Injectable()
export class StripeService {
    private _stripe: Stripe | null = null;

    // Lazy so the app can boot even before the key is set.
    private get stripe(): Stripe {
        if (!this._stripe) {
            this._stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
        }
        return this._stripe;
    }

    async calculateTax(params: {
        currency: string;
        subtotalCents: number;
        shippingCents: number;
        address: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    }): Promise<number> {
        try {
            const calculation = await this.stripe.tax.calculations.create({
                currency: params.currency.toLowerCase(),
                customer_details: {
                    address: {
                        line1: params.address.line1,
                        line2: params.address.line2,
                        city: params.address.city,
                        state: params.address.state,
                        postal_code: params.address.postal_code,
                        country: params.address.country,
                    },
                    address_source: 'shipping',
                },
                line_items: [
                    {
                        amount: params.subtotalCents,
                        reference: 'Products Subtotal',
                        tax_behavior: 'exclusive',
                    }
                ],
                shipping_cost: params.shippingCents > 0 ? {
                    amount: params.shippingCents,
                    tax_behavior: 'exclusive',
                } : undefined,
            });
            console.log(`[Stripe Tax] Calculated tax for address ${params.address.state}, ${params.address.country}:`, calculation.tax_amount_exclusive);
            return calculation.tax_amount_exclusive;
        } catch (error: any) {
            console.error('[Stripe Tax Calculation Error]:', error?.message || error);
            // Fallback to 0 tax if there is an error (e.g. unrecognized address)
            return 0;
        }
    }

    // Creates an AUTHORIZATION hold (manual capture). Money is held, not taken,
    // until we capture after Printify accepts the order.
    async createPaymentIntent(params: {
        amountCents: number;
        currency: string;
        metadata: Record<string, string>;
        shipping?: Stripe.PaymentIntentCreateParams.Shipping;
    }): Promise<Stripe.PaymentIntent> {
        const payload: any = {
            amount: params.amountCents,
            currency: params.currency.toLowerCase(),
            capture_method: 'manual',
            automatic_payment_methods: { enabled: true },
            ...(params.shipping ? { shipping: params.shipping } : {}),
            metadata: params.metadata,
        };
        return this.stripe.paymentIntents.create(payload);
    }

    async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.retrieve(id);
    }

    // Take the previously-authorized money. Called only after fulfillment succeeds.
    async capture(id: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.capture(id);
    }

    // Release the hold WITHOUT charging (used when fulfillment fails).
    async cancel(id: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.cancel(id);
    }

    // Refund an already-captured payment (full or partial).
    async refund(params: {
        paymentIntentId: string;
        amountCents?: number;
        reason?: string;
    }): Promise<Stripe.Refund> {
        return this.stripe.refunds.create({
            payment_intent: params.paymentIntentId,
            amount: params.amountCents,
            metadata: params.reason ? { reason: params.reason } : undefined,
        });
    }

    // Verify + parse a webhook payload (Phase 3).
    constructEvent(payload: Buffer, signature: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            requireEnv('STRIPE_WEBHOOK_SECRET'),
        );
    }
}
