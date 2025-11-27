import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { UserService } from '../services/user.service';
import { AppError } from '../../../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userService.getProfile(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, phone } = req.body;
      const user = await userService.updateProfile(req.user.userId, { name, phone });

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

