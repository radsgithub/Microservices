import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { products } from '../data/products';
import { Product, CreateProductDto, UpdateProductDto, AppError } from '../types';

const router = Router();

// GET /api/products - Get all products
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(
        (p) => p.category === category
      );
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = products.find((p) => p.id === id);
    
    if (!product) {
      const error: AppError = new Error(`Product with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const productData: CreateProductDto = req.body;
    
    // Validation
    if (!productData.name || !productData.price || !productData.image || !productData.category) {
      const error: AppError = new Error('Missing required fields: name, price, image, category');
      error.statusCode = 400;
      throw error;
    }
    
    if (productData.price <= 0) {
      const error: AppError = new Error('Price must be greater than 0');
      error.statusCode = 400;
      throw error;
    }
    
    const newProduct: Product = {
      id: uuidv4(),
      ...productData,
      stock: productData.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductDto = req.body;
    
    const productIndex = products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      const error: AppError = new Error(`Product with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    if (updateData.price !== undefined && updateData.price <= 0) {
      const error: AppError = new Error('Price must be greater than 0');
      error.statusCode = 400;
      throw error;
    }
    
    const updatedProduct: Product = {
      ...products[productIndex],
      ...updateData,
      updatedAt: new Date(),
    };
    
    products[productIndex] = updatedProduct;
    
    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      const error: AppError = new Error(`Product with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    products.splice(productIndex, 1);
    
    res.json({
      success: true,
      message: `Product with ID ${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

