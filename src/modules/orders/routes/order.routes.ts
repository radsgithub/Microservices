import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const orderController = new OrderController();

router.post('/create', authMiddleware, (req, res, next) =>
  orderController.createOrder(req as any, res, next)
);
router.get('/:id', authMiddleware, (req, res, next) =>
  orderController.getOrder(req as any, res, next)
);
router.get('/my', authMiddleware, (req, res, next) =>
  orderController.getMyOrders(req as any, res, next)
);

export default router;

