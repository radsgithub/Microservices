import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware, adminMiddleware } from '../../../middleware/auth';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', (req, res, next) => productController.getProducts(req, res, next));
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));

// Admin routes
router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  productController.createProduct(req, res, next)
);
router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  productController.updateProduct(req, res, next)
);
router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  productController.deleteProduct(req, res, next)
);

export default router;

