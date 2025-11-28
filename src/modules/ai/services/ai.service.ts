import { AIRequestLog, IAIOutput, IAIRequestLog } from '../models/AIRequestLog.model';
import { Product } from '../../products/models/Product.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface AIPredictionInput {
  height: number;
  measurements: {
    bust?: number;
    waist?: number;
    hips?: number;
  };
  style: string;
  productId: string;
}

/**
 * Placeholder AI prediction function
 * TODO: Replace with actual AI/ML model integration
 */
async function predictSizeAndRecommendations(
  input: AIPredictionInput,
  product: any
): Promise<IAIOutput> {
  // Placeholder logic - replace with actual AI model
  const { height, measurements } = input;

  // Simple size prediction based on height and measurements
  let predictedSize = 'M'; // Default
  if (height < 160) {
    predictedSize = 'S';
  } else if (height >= 160 && height < 175) {
    predictedSize = 'M';
  } else if (height >= 175 && height < 185) {
    predictedSize = 'L';
  } else {
    predictedSize = 'XL';
  }

  // Adjust based on measurements if available
  if (measurements.waist) {
    if (measurements.waist < 70) predictedSize = 'S';
    else if (measurements.waist >= 70 && measurements.waist < 85) predictedSize = 'M';
    else if (measurements.waist >= 85 && measurements.waist < 100) predictedSize = 'L';
    else predictedSize = 'XL';
  }

  // Recommend colors based on style preference
  let recommendedColors: string[] = [];
  if (input.style === 'modest' || input.style === 'classic') {
    recommendedColors = product.colors.filter((c: string) =>
      ['black', 'navy', 'beige', 'white'].includes(c.toLowerCase())
    );
  } else if (input.style === 'bold' || input.style === 'vibrant') {
    recommendedColors = product.colors.filter((c: string) =>
      !['black', 'navy', 'beige', 'white'].includes(c.toLowerCase())
    );
  } else {
    recommendedColors = product.colors.slice(0, 3); // Top 3 colors
  }

  // If no colors match style, use all available
  if (recommendedColors.length === 0) {
    recommendedColors = product.colors;
  }

  // Zero-waste quantity estimation
  // TODO: Implement actual zero-waste algorithm
  const recommendedQty = 1; // Default to 1, can be enhanced with ML

  return {
    predictedSize,
    recommendedColors: recommendedColors.slice(0, 5), // Limit to 5 recommendations
    recommendedQty,
  };
}

export class AIService {
  async predict(userId: string, input: AIPredictionInput): Promise<IAIRequestLog> {
    const { productId } = input;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found');
    }

    // Get AI prediction (placeholder function)
    const aiOutput = await predictSizeAndRecommendations(input, product);

    // Log the AI request
    const aiRequestLog = await AIRequestLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      inputs: {
        height: input.height,
        measurements: input.measurements,
        style: input.style,
      },
      aiOutput,
      timestamp: new Date(),
    });

    return aiRequestLog;
  }

  async getPredictionHistory(userId: string) {
    return await AIRequestLog.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('productId')
      .sort({ timestamp: -1 });
  }

  async getPredictionById(userId: string, predictionId: string) {
    const prediction = await AIRequestLog.findOne({
      _id: predictionId,
      userId: new mongoose.Types.ObjectId(userId),
    }).populate('productId');

    if (!prediction) {
      throw new AppError('Prediction not found');
    }

    return prediction;
  }
}

