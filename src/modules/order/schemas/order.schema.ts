import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId!: Types.ObjectId;

    @Prop({ type: Number, required: true })
    quantity!: number;

    @Prop({ type: String })
    size?: string;

    @Prop({ type: String })
    color?: string;

    @Prop({ type: Number, required: true })
    price!: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

    @Prop({ type: [OrderItemSchema], default: [] })
    items!: OrderItem[];

    @Prop({ type: Number, required: true })
    totalAmount!: number;

    @Prop({ type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' })
    paymentStatus!: string;

    // Cash on Delivery is the only method for now (no payment gateway).
    @Prop({ type: String, enum: ['COD'], default: 'COD' })
    paymentMethod!: string;

    @Prop({ type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
    orderStatus!: string;

    @Prop({ type: Types.ObjectId, ref: 'Address' })
    shippingAddressId?: Types.ObjectId;

    @Prop({ type: Number })
    shippingCost?: number;

    @Prop({ type: String })
    shippingCourier?: string;

    @Prop({ type: String })
    shippingServiceName?: string;

    @Prop({ type: String })
    trackingNumber?: string;

    @Prop({ type: String })
    shippingLabelUrl?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
