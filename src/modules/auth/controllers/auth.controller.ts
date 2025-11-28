import { Request, Response, NextFunction } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/auth.service';
import { AppError } from '../../../middleware/errorHandler';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      const data: RegisterData = { name, email, password, phone };
      const result = await authService.register(data);

      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const data: LoginData = { email, password };
      const result = await authService.login(data);

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

