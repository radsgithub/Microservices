import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop([
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
        },
    ])
    items!: {
        productId: Types.ObjectId;
        quantity: number;
    }[];

    @Prop({ type: Number, required: true })
    totalAmount!: number;

    @Prop({ type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
    status!: string;

    @Prop({ type: String })
    paymentMethod!: string;

    @Prop({ type: String })
    shippingAddress!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
