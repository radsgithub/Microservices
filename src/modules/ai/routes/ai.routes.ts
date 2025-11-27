import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const aiController = new AIController();

router.post('/predict', authMiddleware, (req, res, next) =>
  aiController.predict(req as any, res, next)
);
router.get('/history', authMiddleware, (req, res, next) =>
  aiController.getPredictionHistory(req as any, res, next)
);
router.get('/:id', authMiddleware, (req, res, next) =>
  aiController.getPredictionById(req as any, res, next)
);

export default router;

