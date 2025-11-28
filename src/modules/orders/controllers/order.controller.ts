import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { OrderService } from '../services/order.service';
import { AppError } from '../../../middleware/errorHandler';

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { shippingAddressId, cartId, aiPredictionId, shippingCost, shippingCourier, shippingServiceName } = req.body;

      if (!shippingAddressId) {
        res.status(400).json({ error: 'shippingAddressId is required' });
        return;
      }

      const order = await orderService.createOrder(req.user.userId, {
        shippingAddressId,
        cartId,
        aiPredictionId,
        shippingCost,
        shippingCourier,
        shippingServiceName,
      });

      res.status(201).json(order);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const order = await orderService.getOrder(req.user.userId, id);

      res.status(200).json(order);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const orders = await orderService.getMyOrders(req.user.userId);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getPendingOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const orders = await orderService.getPendingOrders();
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }
}

