import mongoose, { Schema, Document } from 'mongoose';

export interface IMeasurements {
  bust?: number;
  waist?: number;
  hips?: number;
}

export interface IAIOutput {
  predictedSize: string;
  recommendedColors: string[];
  recommendedQty: number;
}

export interface IAIRequestLog extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  inputs: {
    height: number;
    measurements: IMeasurements;
    style: string;
  };
  aiOutput: IAIOutput;
  timestamp: Date;
}

const MeasurementsSchema = new Schema<IMeasurements>(
  {
    bust: Number,
    waist: Number,
    hips: Number,
  },
  { _id: false }
);

const AIOutputSchema = new Schema<IAIOutput>(
  {
    predictedSize: {
      type: String,
      required: true,
    },
    recommendedColors: [
      {
        type: String,
      },
    ],
    recommendedQty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const AIRequestLogSchema = new Schema<IAIRequestLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    inputs: {
      height: {
        type: Number,
        required: true,
      },
      measurements: MeasurementsSchema,
      style: {
        type: String,
        required: true,
      },
    },
    aiOutput: AIOutputSchema,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const AIRequestLog = mongoose.model<IAIRequestLog>('AIRequestLog', AIRequestLogSchema);

