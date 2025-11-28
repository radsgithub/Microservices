import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { AIService } from '../services/ai.service';
import { AppError } from '../../../middleware/errorHandler';

const aiService = new AIService();

export class AIController {
  async predict(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { height, measurements, style, productId } = req.body;

      if (!height || !style || !productId) {
        res.status(400).json({ error: 'height, style, and productId are required' });
        return;
      }

      const prediction = await aiService.predict(req.user.userId, {
        height,
        measurements: measurements || {},
        style,
        productId,
      });

      res.status(200).json({
        predictedSize: prediction.aiOutput.predictedSize,
        recommendedColors: prediction.aiOutput.recommendedColors,
        recommendedQty: prediction.aiOutput.recommendedQty,
        predictionId: prediction._id,
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async getPredictionHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const history = await aiService.getPredictionHistory(req.user.userId);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  async getPredictionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const prediction = await aiService.getPredictionById(req.user.userId, id);

      res.status(200).json(prediction);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

