import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { CartService } from '../services/cart.service';
import { AppError } from '../../../middleware/errorHandler';

const cartService = new CartService();

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const cart = await cartService.getCart(req.user.userId);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { productId, quantity, size, color } = req.body;

      if (!productId || !quantity || !size || !color) {
        res.status(400).json({ error: 'productId, quantity, size, and color are required' });
        return;
      }

      const cart = await cartService.addToCart(req.user.userId, {
        productId,
        quantity,
        size,
        color,
      });

      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async updateCartItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { itemId } = req.params;
      const cart = await cartService.updateCartItem(req.user.userId, itemId, req.body);

      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async removeCartItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { itemId } = req.params;
      const cart = await cartService.removeCartItem(req.user.userId, itemId);

      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

