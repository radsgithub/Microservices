import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

    @Prop([
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            totalPrice: { type: Number, required: true },
            name: { type: String, required: true },
            price: { type: String, required: true },
            stock: { type: Number, required: true },
        },
    ])
    items!: {
        productId: Types.ObjectId;
        quantity: number;
        totalPrice: number;
        name: string;
        price: string;
        stock: number;
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
