import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, type: String })
    name!: string | undefined;

    @Prop({ type: String })
    description!: string;

    @Prop({ required: true, type: Number })
    price!: number;

    @Prop({ required: true, type: Number })
    stock!: number;

    @Prop({ type: String })
    category!: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: String })
    imageUrl!: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
