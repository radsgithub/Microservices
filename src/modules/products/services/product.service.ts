import { Product } from '../models/Product.model';
import { AppError } from '../../../middleware/errorHandler';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  fabricInfo?: string;
  isRecycledFabric?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export class ProductService {
  async createProduct(data: CreateProductData) {
    return await Product.create(data);
  }

  async getProducts(filters?: { category?: string; search?: string }) {
    const query: any = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return await Product.find(query);
  }

  async getProductById(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found');
    }
    return product;
  }

  async updateProduct(productId: string, data: UpdateProductData) {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found');
    }

    return product;
  }

  async deleteProduct(productId: string) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new AppError('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }
}

