import mongoose, { Schema, Document } from 'mongoose';

export interface IShipping extends Document {
  orderId: mongoose.Types.ObjectId;
  courier: string;
  serviceName: string;
  trackingNumber?: string;
  labelUrl?: string;
  shippingStatus: 'pending' | 'booked' | 'in_transit' | 'delivered' | 'failed';
  estimatedDelivery?: string;
  actualDelivery?: Date;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShippingSchema = new Schema<IShipping>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    courier: {
      type: String,
      required: true,
      default: 'EVRI',
    },
    serviceName: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    labelUrl: {
      type: String,
    },
    shippingStatus: {
      type: String,
      enum: ['pending', 'booked', 'in_transit', 'delivered', 'failed'],
      default: 'pending',
    },
    estimatedDelivery: {
      type: String,
    },
    actualDelivery: {
      type: Date,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Shipping = mongoose.model<IShipping>('Shipping', ShippingSchema);

