import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authMiddleware } from '../../../middleware/auth';

const router = Router();
const addressController = new AddressController();

router.post('/add', authMiddleware, (req, res, next) =>
  addressController.addAddress(req as any, res, next)
);
router.get('/list', authMiddleware, (req, res, next) =>
  addressController.listAddresses(req as any, res, next)
);
router.put('/update/:id', authMiddleware, (req, res, next) =>
  addressController.updateAddress(req as any, res, next)
);
router.delete('/:id', authMiddleware, (req, res, next) =>
  addressController.deleteAddress(req as any, res, next)
);

export default router;

