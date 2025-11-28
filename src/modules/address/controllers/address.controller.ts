import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { AddressService } from '../services/address.service';
import { AppError } from '../../../middleware/errorHandler';

const addressService = new AddressService();

export class AddressController {
  async addAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { line1, line2, city, state, country, postalCode, isDefault } = req.body;

      if (!line1 || !city || !state || !country || !postalCode) {
        res.status(400).json({ error: 'Required fields: line1, city, state, country, postalCode' });
        return;
      }

      const address = await addressService.addAddress(req.user.userId, {
        line1,
        line2,
        city,
        state,
        country,
        postalCode,
        isDefault,
      });

      res.status(201).json(address);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async listAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addresses = await addressService.listAddresses(req.user.userId);
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const address = await addressService.updateAddress(req.user.userId, id, req.body);

      res.status(200).json(address);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await addressService.deleteAddress(req.user.userId, id);

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

