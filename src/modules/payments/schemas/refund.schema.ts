import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const REFUND_STATUSES = ['pending', 'succeeded', 'failed'] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export type RefundDocument = Refund & Document;

// One record per refund attempt. Supports partial refunds (amountCents can be
// less than the order total). stripeRefundId is unique so a refund can never
// be double-recorded.
@Schema({ timestamps: true })
export class Refund {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
    orderId!: Types.ObjectId;

    @Prop({ type: String, index: true })
    stripePaymentIntentId?: string;

    @Prop({ type: String, unique: true, sparse: true })
    stripeRefundId?: string;

    @Prop({ type: Number, required: true, min: 1 })
    amountCents!: number;

    @Prop({ type: String, required: true, default: 'USD' })
    currency!: string;

    @Prop({ type: String })
    reason?: string;

    @Prop({ type: String, enum: REFUND_STATUSES, default: 'pending' })
    status!: RefundStatus;

    // Admin user id who issued it, or 'system' for automatic refunds.
    @Prop({ type: String, required: true })
    issuedBy!: string;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
