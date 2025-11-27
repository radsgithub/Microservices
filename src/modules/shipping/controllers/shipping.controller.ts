import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { ShippingService, GetRateRequest, BookShipmentRequest } from '../services/shipping.service';
import { AppError } from '../../../middleware/errorHandler';

const shippingService = new ShippingService();

export class ShippingController {
  async getRate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courier, from, to, weight, length, width, height } = req.body;

      if (!courier || !from || !to || !weight || !length || !width || !height) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const rateData: GetRateRequest = {
        courier: courier.toUpperCase(),
        from,
        to,
        weight: parseFloat(weight),
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
      };

      const rate = await shippingService.getRate(rateData);
      res.status(200).json(rate);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async bookShipment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { orderId, courier, recipient, parcel } = req.body;

      if (!orderId || !courier || !recipient || !parcel) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const bookingData: BookShipmentRequest = {
        courier: courier.toUpperCase(),
        recipient,
        parcel,
      };

      const result = await shippingService.bookShipment(req.user.userId, orderId, bookingData);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async trackShipment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        res.status(400).json({ error: 'Tracking number is required' });
        return;
      }

      const tracking = await shippingService.trackShipment(trackingNumber);
      res.status(200).json(tracking);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

