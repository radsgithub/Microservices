import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

// Append-only trail of everything money- or order-related. Never updated or
// deleted — it's the record of truth if we ever need to reconcile a payment,
// a refund, or a fulfillment problem.
@Schema({ timestamps: true })
export class AuditLog {
    // e.g. 'order.created', 'payment.authorized', 'payment.captured',
    // 'printify.order_created', 'refund.issued', 'webhook.received'
    @Prop({ type: String, required: true, index: true })
    action!: string;

    @Prop({ type: String, enum: ['info', 'warn', 'error'], default: 'info' })
    level!: string;

    @Prop({ type: String, required: true })
    message!: string;

    @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
    orderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    userId?: Types.ObjectId;

    // Free-form context: amounts, ids, provider responses (never raw secrets).
    @Prop({ type: Object })
    meta?: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
