import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FabricInventoryDocument = FabricInventory & Document;

@Schema({ timestamps: true })
export class FabricInventory {
    @Prop({ required: true }) fabricType!: string;
    @Prop({ required: true }) color!: string;

    @Prop({ type: String, enum: ['recycled', 'new'], default: 'new' })
    source!: string;

    @Prop({ default: 0 }) quantity!: number;   // meters available
    @Prop({ default: 0 }) cost!: number;        // cost per meter
    @Prop({ default: 50 }) sustainabilityScore!: number;
}

export const FabricInventorySchema = SchemaFactory.createForClass(FabricInventory);
