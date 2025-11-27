import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const cartController = new CartController();

router.get('/', authMiddleware, (req, res, next) => cartController.getCart(req as any, res, next));
router.post('/add', authMiddleware, (req, res, next) =>
  cartController.addToCart(req as any, res, next)
);
router.put('/update/:itemId', authMiddleware, (req, res, next) =>
  cartController.updateCartItem(req as any, res, next)
);
router.delete('/remove/:itemId', authMiddleware, (req, res, next) =>
  cartController.removeCartItem(req as any, res, next)
);

export default router;

