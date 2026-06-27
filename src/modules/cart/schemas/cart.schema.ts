import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// One line item in a cart. Each gets its own `_id` (used by the frontend to
// update/remove individual items).
@Schema({ _id: true })
export class CartItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId!: Types.ObjectId;

    @Prop({ type: Number, required: true, default: 1 })
    quantity!: number;

    @Prop({ type: String })
    size?: string;

    @Prop({ type: String })
    color?: string;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId!: Types.ObjectId;

    @Prop({ type: [CartItemSchema], default: [] })
    items!: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
