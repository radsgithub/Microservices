import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductionBatchDocument = ProductionBatch & Document;

@Schema({ timestamps: true })
export class ProductionBatch {
    @Prop({ required: true, unique: true })
    batchId!: string;

    @Prop({
        type: [{
            orderId: { type: Types.ObjectId, ref: 'Order' },
            productId: { type: Types.ObjectId, ref: 'Product' },
            size: String,
            color: String,
            quantity: Number,
        }],
        default: [],
    })
    items!: {
        orderId: Types.ObjectId;
        productId: Types.ObjectId;
        size: string;
        color: string;
        quantity: number;
    }[];

    @Prop() fabricType!: string;
    @Prop() fabricColor!: string;
    @Prop({ default: 0 }) fabricUsed!: number;
    @Prop({ default: 0 }) wasteGenerated!: number;
    @Prop({ default: 0 }) efficiency!: number;

    @Prop({ type: String, enum: ['pending', 'in-production', 'completed', 'cancelled'], default: 'pending' })
    status!: string;

    @Prop() productionStartDate?: Date;
    @Prop() productionEndDate?: Date;
}

export const ProductionBatchSchema = SchemaFactory.createForClass(ProductionBatch);
