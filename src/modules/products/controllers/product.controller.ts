import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AppError } from '../../../middleware/errorHandler';

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        description,
        price,
        category,
        images,
        sizes,
        colors,
        stock,
        fabricInfo,
        isRecycledFabric,
      } = req.body;

      if (!name || !description || !price || !category || !stock) {
        res.status(400).json({ error: 'Required fields: name, description, price, category, stock' });
        return;
      }

      const product = await productService.createProduct({
        name,
        description,
        price,
        category,
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        stock,
        fabricInfo,
        isRecycledFabric: isRecycledFabric || false,
      });

      res.status(201).json(product);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search } = req.query;
      const products = await productService.getProducts({
        category: category as string,
        search: search as string,
      });
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      res.status(200).json(product);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      res.status(200).json(product);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

