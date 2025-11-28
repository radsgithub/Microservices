import { Router } from 'express';
import { ProductionController } from '../controllers/production.controller';
import { authMiddleware, adminMiddleware } from '../../../middleware/auth';

const router = Router();
const productionController = new ProductionController();

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/optimize', (req, res, next) =>
  productionController.optimizeProduction(req, res, next)
);
router.get('/batches/pending', (req, res, next) =>
  productionController.getPendingBatches(req, res, next)
);
router.get('/batches', (req, res, next) =>
  productionController.getAllBatches(req, res, next)
);
router.post('/batches/:batchId/start', (req, res, next) =>
  productionController.startBatch(req, res, next)
);
router.post('/batches/:batchId/complete', (req, res, next) =>
  productionController.completeBatch(req, res, next)
);
router.get('/fabric-inventory', (req, res, next) =>
  productionController.getFabricInventory(req, res, next)
);
router.post('/fabric-inventory', (req, res, next) =>
  productionController.updateFabricInventory(req, res, next)
);

export default router;

