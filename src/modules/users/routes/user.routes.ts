import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const userController = new UserController();

router.get('/profile', authMiddleware, (req, res, next) =>
  userController.getProfile(req as any, res, next)
);
router.put('/update', authMiddleware, (req, res, next) =>
  userController.updateProfile(req as any, res, next)
);

export default router;

