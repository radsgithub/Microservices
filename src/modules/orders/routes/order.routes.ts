import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware, adminMiddleware } from '../../../middleware/auth';

const router = Router();
const orderController = new OrderController();

router.post('/create', authMiddleware, (req, res, next) =>
  orderController.createOrder(req as any, res, next)
);
router.get('/pending', authMiddleware, adminMiddleware, (req, res, next) =>
  orderController.getPendingOrders(req as any, res, next)
);
// IMPORTANT: More specific routes must come before parameterized routes
router.get('/my', authMiddleware, (req, res, next) =>
  orderController.getMyOrders(req as any, res, next)
);
router.get('/:id', authMiddleware, (req, res, next) =>
  orderController.getOrder(req as any, res, next)
);

export default router;

