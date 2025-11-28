import mongoose, { Schema, Document } from 'mongoose';

export interface IProductionBatchItem {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
}

export interface IProductionBatch extends Document {
  batchId: string;
  items: IProductionBatchItem[];
  fabricType: string;
  fabricColor: string;
  fabricUsed: number; // in meters
  wasteGenerated: number; // in meters
  efficiency: number; // percentage
  status: 'pending' | 'in-production' | 'completed' | 'cancelled';
  productionStartDate?: Date;
  productionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionBatchItemSchema = new Schema<IProductionBatchItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const ProductionBatchSchema = new Schema<IProductionBatch>(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [ProductionBatchItemSchema],
    fabricType: {
      type: String,
      required: true,
    },
    fabricColor: {
      type: String,
      required: true,
    },
    fabricUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    wasteGenerated: {
      type: Number,
      required: true,
      min: 0,
    },
    efficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'in-production', 'completed', 'cancelled'],
      default: 'pending',
    },
    productionStartDate: {
      type: Date,
    },
    productionEndDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductionBatch = mongoose.model<IProductionBatch>(
  'ProductionBatch',
  ProductionBatchSchema
);

