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
 * Enhanced AI prediction function with style-based color analysis
 * Uses improved algorithms for size prediction and color recommendations
 */
async function predictSizeAndRecommendations(
  input: AIPredictionInput,
  product: any
): Promise<IAIOutput> {
  const { height, measurements } = input;

  // Enhanced size prediction using multiple factors
  let predictedSize = 'M'; // Default
  
  // Factor 1: Height-based prediction
  if (height < 155) {
    predictedSize = 'S';
  } else if (height >= 155 && height < 165) {
    predictedSize = 'S';
  } else if (height >= 165 && height < 175) {
    predictedSize = 'M';
  } else if (height >= 175 && height < 180) {
    predictedSize = 'L';
  } else if (height >= 180 && height < 190) {
    predictedSize = 'XL';
  } else {
    predictedSize = 'XXL';
  }

  // Factor 2: Measurement-based adjustment (more accurate)
  if (measurements.waist || measurements.bust || measurements.hips) {
    const waist = measurements.waist || 0;
    const bust = measurements.bust || 0;
    const hips = measurements.hips || 0;
    
    // Average measurements for better accuracy
    const avgMeasurement = (waist + bust + hips) / 3;
    
    if (avgMeasurement > 0) {
      if (avgMeasurement < 75) {
        predictedSize = 'S';
      } else if (avgMeasurement >= 75 && avgMeasurement < 90) {
        predictedSize = 'M';
      } else if (avgMeasurement >= 90 && avgMeasurement < 105) {
        predictedSize = 'L';
      } else if (avgMeasurement >= 105 && avgMeasurement < 120) {
        predictedSize = 'XL';
      } else {
        predictedSize = 'XXL';
      }
    }
    
    // Waist-specific adjustment (most important for fit)
    if (measurements.waist) {
      if (measurements.waist < 65) predictedSize = 'S';
      else if (measurements.waist >= 65 && measurements.waist < 80) predictedSize = 'M';
      else if (measurements.waist >= 80 && measurements.waist < 95) predictedSize = 'L';
      else if (measurements.waist >= 95 && measurements.waist < 110) predictedSize = 'XL';
      else predictedSize = 'XXL';
    }
  }

  // Ensure predicted size is available in product
  if (!product.sizes.includes(predictedSize)) {
    // Find closest available size
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    const predictedIndex = sizeOrder.indexOf(predictedSize);
    if (predictedIndex === -1) {
      predictedSize = product.sizes[0] || 'M';
    } else {
      // Find nearest available size
      for (let i = 0; i < sizeOrder.length; i++) {
        const checkSize = sizeOrder[Math.abs(predictedIndex - i)];
        if (product.sizes.includes(checkSize)) {
          predictedSize = checkSize;
          break;
        }
      }
    }
  }

  // Enhanced color recommendation based on style
  let recommendedColors: string[] = [];
  const availableColors = product.colors || [];
  const style = input.style.toLowerCase().trim();

  // Helper function to check if a color matches any of the keywords (case-insensitive, partial match)
  const colorMatches = (colorName: string, keywords: string[]): boolean => {
    const colorLower = colorName.toLowerCase().trim();
    return keywords.some(keyword => colorLower.includes(keyword.toLowerCase().trim()));
  };

  // Helper function to score colors based on style relevance
  const getColorScore = (colorName: string, styleKeywords: string[]): number => {
    const colorLower = colorName.toLowerCase().trim();
    let score = 0;
    styleKeywords.forEach(keyword => {
      if (colorLower === keyword.toLowerCase().trim()) {
        score += 10; // Exact match
      } else if (colorLower.includes(keyword.toLowerCase().trim())) {
        score += 5; // Partial match
      }
    });
    return score;
  };

  // Define style-specific color keywords
  let styleKeywords: string[] = [];
  
  if (style === 'modest' || style === 'classic') {
    // Modest/Classic: Prefer neutral, professional colors
    styleKeywords = ['black', 'navy', 'beige', 'white', 'gray', 'grey', 'brown', 'burgundy', 'maroon', 'tan', 'khaki', 'cream', 'ivory', 'charcoal', 'slate', 'muted', 'soft'];
  } else if (style === 'bold' || style === 'vibrant') {
    // Bold/Vibrant: Prefer bright, eye-catching colors
    styleKeywords = ['red', 'pink', 'yellow', 'orange', 'green', 'blue', 'purple', 'turquoise', 'coral', 'magenta', 'lime', 'neon', 'bright', 'vibrant', 'electric', 'hot', 'fire'];
  } else if (style === 'modern') {
    // Modern: Mix of contemporary colors (can include both bold and neutral)
    styleKeywords = ['black', 'white', 'gray', 'navy', 'red', 'blue', 'green', 'orange', 'yellow', 'pink', 'purple', 'teal', 'mint', 'coral', 'sage', 'dusty'];
  } else if (style === 'elegant' || style === 'sophisticated') {
    // Elegant: Prefer rich, sophisticated colors
    styleKeywords = ['black', 'navy', 'burgundy', 'maroon', 'emerald', 'royal', 'charcoal', 'slate', 'wine', 'plum', 'forest', 'midnight', 'sapphire', 'ruby', 'deep', 'rich'];
  } else {
    // Default: Use all available colors
    styleKeywords = [];
  }

  // Score and sort colors by relevance to style
  if (styleKeywords.length > 0) {
    const colorScores = availableColors.map((color: string) => ({
      color,
      score: getColorScore(color, styleKeywords),
    }));
    
    // Sort by score (highest first) and filter out zero scores
    colorScores.sort((a, b) => b.score - a.score);
    recommendedColors = colorScores
      .filter(item => item.score > 0)
      .map(item => item.color);
    
    // If we have matches, use them; otherwise fall through to secondary logic
    if (recommendedColors.length === 0) {
      // Secondary matching: exclude opposite style colors
      if (style === 'modest' || style === 'classic') {
        const excludeKeywords = ['red', 'pink', 'yellow', 'orange', 'lime', 'neon', 'bright', 'vibrant', 'electric'];
        recommendedColors = availableColors.filter((c: string) => {
          const colorLower = c.toLowerCase();
          return !excludeKeywords.some(keyword => colorLower.includes(keyword));
        });
      } else if (style === 'bold' || style === 'vibrant') {
        const excludeKeywords = ['beige', 'tan', 'khaki', 'cream', 'ivory', 'muted', 'soft', 'pastel'];
        recommendedColors = availableColors.filter((c: string) => {
          const colorLower = c.toLowerCase();
          return !excludeKeywords.some(keyword => colorLower.includes(keyword));
        });
      }
    }
  } else {
    // Default style: use all available colors
    recommendedColors = availableColors;
  }

  // Ensure we have at least some colors
  if (recommendedColors.length === 0) {
    recommendedColors = availableColors;
  }

  // Limit to top 5 recommendations, prioritizing by style relevance
  recommendedColors = recommendedColors.slice(0, 5);
  
  // Final fallback: if still empty, use first available color
  if (recommendedColors.length === 0 && availableColors.length > 0) {
    recommendedColors = [availableColors[0]];
  }

  // Zero-waste quantity recommendation
  // For now, default to 1, but can be enhanced based on:
  // - Customer purchase history
  // - Product popularity
  // - Inventory levels
  const recommendedQty = 1;

  return {
    predictedSize,
    recommendedColors,
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

