import { Router } from 'express';
import { ShippingController } from '../controllers/shipping.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const shippingController = new ShippingController();

router.post('/get-rate', (req, res, next) => shippingController.getRate(req as any, res, next));
router.post('/book', authMiddleware, (req, res, next) => shippingController.bookShipment(req as any, res, next));
router.get('/track/:trackingNumber', (req, res, next) => shippingController.trackShipment(req as any, res, next));

export default router;

