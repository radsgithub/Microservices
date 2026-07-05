import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

// Idempotency ledger. Before processing any Stripe/Printify webhook we insert
// (source, eventId); the unique index makes a duplicate insert fail, so the
// same event can never be processed twice (no double captures / double refunds).
@Schema({ timestamps: true })
export class WebhookEvent {
    @Prop({ type: String, required: true, enum: ['stripe', 'printify'] })
    source!: string;

    @Prop({ type: String, required: true })
    eventId!: string;

    @Prop({ type: String })
    type?: string;

    @Prop({ type: Date })
    processedAt?: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
// Composite unique index — one row per (source, eventId).
WebhookEventSchema.index({ source: 1, eventId: 1 }, { unique: true });
