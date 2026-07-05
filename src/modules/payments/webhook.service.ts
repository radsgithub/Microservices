import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import Stripe from 'stripe';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';
import { CheckoutService } from './checkout.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class WebhookService {
    constructor(
        @InjectModel(WebhookEvent.name) private readonly eventModel: Model<WebhookEventDocument>,
        private readonly checkout: CheckoutService,
        private readonly audit: AuditService,
    ) { }

    // Records the event; returns false if it was already processed (unique index
    // on {source, eventId} makes the duplicate insert fail → true idempotency).
    private async claim(source: string, eventId: string, type?: string): Promise<boolean> {
        try {
            await this.eventModel.create({ source, eventId, type, processedAt: new Date() });
            return true;
        } catch (err: any) {
            if (err?.code === 11000) return false; // duplicate → already handled
            throw err;
        }
    }

    async processStripe(event: Stripe.Event): Promise<void> {
        const fresh = await this.claim('stripe', event.id, event.type);
        if (!fresh) return;

        try {
            const pi = event.data.object as Stripe.PaymentIntent;
            switch (event.type) {
                case 'payment_intent.amount_capturable_updated':
                    // Customer authorized → fulfill (idempotent with confirm()).
                    await this.checkout.fulfillByPaymentIntent(pi.id);
                    break;
                case 'payment_intent.canceled':
                    await this.checkout.handlePaymentCanceled(pi.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.checkout.handlePaymentFailed(pi.id);
                    break;
                default:
                    break; // ignore other events
            }
        } catch (err) {
            // Log but don't throw — returning 200 prevents Stripe retry storms;
            // the confirm endpoint is the other path to completion.
            await this.audit.log({
                action: 'webhook.stripe_error',
                level: 'error',
                message: `Stripe webhook ${event.type} failed: ${err instanceof Error ? err.message : err}`,
                meta: { eventId: event.id, type: event.type },
            });
        }
    }

    // Verify Printify's HMAC signature if a secret is configured.
    verifyPrintify(rawBody: Buffer, signature?: string): boolean {
        const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
        if (!secret) return true; // not configured → skip (dev)
        const expected = 'sha256=' +
            crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        const a = Buffer.from(expected);
        const b = Buffer.from(signature || '');
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    async processPrintify(body: any): Promise<void> {
        const eventId = String(body?.id ?? `${body?.type}:${body?.resource?.id}:${body?.created_at}`);
        const type = body?.type as string | undefined;
        const fresh = await this.claim('printify', eventId, type);
        if (!fresh) return;

        const printifyOrderId = body?.resource?.id;
        if (!printifyOrderId) return;
        try {
            await this.checkout.syncPrintifyOrder(String(printifyOrderId));
        } catch (err) {
            await this.audit.log({
                action: 'webhook.printify_error',
                level: 'error',
                message: `Printify webhook ${type} failed: ${err instanceof Error ? err.message : err}`,
                meta: { eventId, type },
            });
        }
    }
}
