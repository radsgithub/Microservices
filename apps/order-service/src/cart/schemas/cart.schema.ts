import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

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

    @Prop({ type: Number, default: 0 })
    totalPrice!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
