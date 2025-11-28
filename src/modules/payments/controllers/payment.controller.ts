import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../../../middleware/errorHandler';

const paymentService = new PaymentService();

export class PaymentController {
  async createMandate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { userEmail, userName, userAddressId, redirectUri } = req.body;

      if (!userEmail || !userName || !userAddressId || !redirectUri) {
        res.status(400).json({
          error: 'userEmail, userName, userAddressId, and redirectUri are required',
        });
        return;
      }

      const result = await paymentService.createMandate(req.user.userId, {
        userEmail,
        userName,
        userAddressId,
        redirectUri,
      });

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async createOrderPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { orderId, mandateId } = req.body;

      if (!orderId || !mandateId) {
        res.status(400).json({ error: 'orderId and mandateId are required' });
        return;
      }

      const result = await paymentService.createOrderPayment(req.user.userId, {
        orderId,
        mandateId,
      });

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Note: In production, verify webhook signature from GoCardless
      const result = await paymentService.handleWebhook(req.body);

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

