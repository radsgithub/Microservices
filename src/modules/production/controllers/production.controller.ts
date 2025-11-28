import { Request, Response, NextFunction } from 'express';
import { ProductionService } from '../services/production.service';
import { AppError } from '../../../middleware/errorHandler';

const productionService = new ProductionService();

export class ProductionController {
  async optimizeProduction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderIds } = req.body;
      const result = await productionService.optimizeProduction(orderIds);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to optimize production', 500));
      }
    }
  }

  async getPendingBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const batches = await productionService.getPendingBatches();
      res.status(200).json(batches);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to get pending batches', 500));
      }
    }
  }

  async getAllBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const batches = await productionService.getAllBatches();
      res.status(200).json(batches);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to get batches', 500));
      }
    }
  }

  async startBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const batch = await productionService.startBatch(batchId);
      res.status(200).json(batch);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to start batch', 500));
      }
    }
  }

  async completeBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const { actualWaste } = req.body;
      const batch = await productionService.completeBatch(batchId, actualWaste);
      res.status(200).json(batch);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to complete batch', 500));
      }
    }
  }

  async getFabricInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventory = await productionService.getFabricInventory();
      res.status(200).json(inventory);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to get fabric inventory', 500));
      }
    }
  }

  async updateFabricInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fabricType, color, quantity, cost, source } = req.body;
      const fabric = await productionService.updateFabricInventory(
        fabricType,
        color,
        quantity,
        cost,
        source
      );
      res.status(200).json(fabric);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError('Failed to update fabric inventory', 500));
      }
    }
  }
}

