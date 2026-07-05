import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Order lifecycle. Money-safe path:
//   created -> authorized (Stripe hold) -> in_production (Printify accepted +
//   payment captured) -> shipped -> delivered.
// Failure paths: failed (no charge), canceled, refunded.
export const ORDER_STATUSES = [
    'created',
    'authorized',
    'in_production',
    'shipped',
    'delivered',
    'failed',
    'canceled',
    'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
    'pending',
    'authorized',
    'captured',
    'failed',
    'refunded',
    'partially_refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// A snapshot of what was bought — self-contained, references Printify by id.
// No ref to a local Product (products live in Printify now).
@Schema({ _id: false })
export class OrderItem {
    @Prop({ type: String, required: true })
    printifyProductId!: string;

    @Prop({ type: Number, required: true })
    printifyVariantId!: number;

    @Prop({ type: String, required: true })
    name!: string;

    @Prop({ type: String })
    variantLabel?: string;

    @Prop({ type: Number, required: true, min: 1 })
    quantity!: number;

    // Unit price in minor units (cents) at time of purchase.
    @Prop({ type: Number, required: true, min: 0 })
    unitPriceCents!: number;

    @Prop({ type: String })
    image?: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Shipping address is snapshotted onto the order (not a ref) so it can never
// change or disappear after the order is placed.
@Schema({ _id: false })
export class ShippingAddress {
    @Prop({ type: String, required: true }) firstName!: string;
    @Prop({ type: String, required: true }) lastName!: string;
    @Prop({ type: String, required: true }) email!: string;
    @Prop({ type: String, required: true }) phone!: string;
    @Prop({ type: String, required: true }) address1!: string;
    @Prop({ type: String }) address2?: string;
    @Prop({ type: String, required: true }) city!: string;
    @Prop({ type: String, required: true }) region!: string;
    @Prop({ type: String, required: true }) zip!: string;
    @Prop({ type: String, required: true }) country!: string; // ISO-2
}
export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
export class Tracking {
    @Prop({ type: String }) carrier?: string;
    @Prop({ type: String }) number?: string;
    @Prop({ type: String }) url?: string;
}
export const TrackingSchema = SchemaFactory.createForClass(Tracking);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: [OrderItemSchema],
        required: true,
        validate: (v: unknown[]) => Array.isArray(v) && v.length > 0,
    })
    items!: OrderItem[];

    // All money in minor units (cents). Never floats.
    @Prop({ type: Number, required: true, min: 0 }) subtotalCents!: number;
    @Prop({ type: Number, default: 0, min: 0 }) shippingCents!: number;
    @Prop({ type: Number, required: true, min: 0 }) totalCents!: number;
    @Prop({ type: String, required: true, default: 'USD' }) currency!: string;

    @Prop({ type: String, enum: ORDER_STATUSES, default: 'created', index: true })
    orderStatus!: OrderStatus;

    @Prop({ type: String, enum: PAYMENT_STATUSES, default: 'pending' })
    paymentStatus!: PaymentStatus;

    @Prop({ type: ShippingAddressSchema, required: true })
    shippingAddress!: ShippingAddress;

    // Stripe linkage
    @Prop({ type: String, index: true }) stripePaymentIntentId?: string;

    // Printify linkage
    @Prop({ type: String, index: true }) printifyOrderId?: string;

    @Prop({ type: Number, default: 0, min: 0 }) refundedCents!: number;

    @Prop({ type: [TrackingSchema], default: [] })
    tracking!: Tracking[];

    // Free-form notes for reconciliation / failure reasons.
    @Prop({ type: String }) note?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
