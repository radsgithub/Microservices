import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

router.post('/create-mandate', authMiddleware, (req, res, next) =>
  paymentController.createMandate(req as any, res, next)
);
router.post('/create-order-payment', authMiddleware, (req, res, next) =>
  paymentController.createOrderPayment(req as any, res, next)
);
router.post('/webhooks', (req, res, next) => paymentController.handleWebhook(req, res, next));

export default router;

