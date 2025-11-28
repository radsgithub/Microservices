import mongoose, { Schema, Document } from 'mongoose';

export interface IFabricInventory extends Document {
  fabricType: string;
  color: string;
  source: 'recycled' | 'new';
  quantity: number; // in meters
  cost: number; // per meter
  sustainabilityScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

const FabricInventorySchema = new Schema<IFabricInventory>(
  {
    fabricType: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ['recycled', 'new'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    sustainabilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const FabricInventory = mongoose.model<IFabricInventory>(
  'FabricInventory',
  FabricInventorySchema
);

