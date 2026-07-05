import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const PAYMENT_RECORD_STATUSES = [
    'requires_capture', // authorized hold placed, not yet captured
    'captured', // money actually taken
    'canceled', // authorization released (never charged)
    'failed',
] as const;
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

export type PaymentDocument = Payment & Document;

// One record per Stripe PaymentIntent. Mirrors Stripe state in our DB so we
// have an authoritative local record independent of the Stripe dashboard.
@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
    orderId!: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true })
    stripePaymentIntentId!: string;

    @Prop({ type: Number, required: true, min: 0 })
    amountCents!: number;

    @Prop({ type: String, required: true, default: 'USD' })
    currency!: string;

    @Prop({ type: String, enum: PAYMENT_RECORD_STATUSES, required: true })
    status!: PaymentRecordStatus;

    @Prop({ type: Date })
    capturedAt?: Date;

    // Provider brand/last4 etc. for support (never full card data).
    @Prop({ type: Object })
    method?: Record<string, unknown>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
