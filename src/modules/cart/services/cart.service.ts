import { Cart, ICartItem } from '../models/Cart.model';
import { Product } from '../../products/models/Product.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface AddToCartData {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export interface UpdateCartItemData {
  quantity?: number;
  size?: string;
  color?: string;
}

export class CartService {
  async getCart(userId: string) {
    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate(
      'items.productId'
    );

    if (!cart) {
      cart = await Cart.create({
        userId: new mongoose.Types.ObjectId(userId),
        items: [],
      });
    }

    return cart;
  }

  async addToCart(userId: string, data: AddToCartData) {
    const { productId, quantity, size, color } = data;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found');
    }

    // Verify size and color are available
    if (!product.sizes.includes(size)) {
      throw new AppError('Size not available for this product');
    }
    if (!product.colors.includes(color)) {
      throw new AppError('Color not available for this product');
    }

    // Verify stock
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock');
    }

    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      cart = await Cart.create({
        userId: new mongoose.Types.ObjectId(userId),
        items: [],
      });
    }

    // Check if item already exists with same productId, size, and color
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        size,
        color,
      });
    }

    await cart.save();
    return await Cart.findById(cart._id).populate('items.productId');
  }

  async updateCartItem(userId: string, itemId: string, data: UpdateCartItemData) {
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      throw new AppError('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item._id?.toString() === itemId);
    if (itemIndex === -1) {
      throw new AppError('Cart item not found');
    }

    const item = cart.items[itemIndex];

    // If updating productId, verify product exists
    if (data.size || data.color) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError('Product not found');
      }

      if (data.size && !product.sizes.includes(data.size)) {
        throw new AppError('Size not available for this product');
      }
      if (data.color && !product.colors.includes(data.color)) {
        throw new AppError('Color not available for this product');
      }
    }

    // Update item
    if (data.quantity !== undefined) {
      if (data.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        item.quantity = data.quantity;
      }
    }
    if (data.size) item.size = data.size;
    if (data.color) item.color = data.color;

    await cart.save();
    return await Cart.findById(cart._id).populate('items.productId');
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      throw new AppError('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item._id?.toString() === itemId);
    if (itemIndex === -1) {
      throw new AppError('Cart item not found');
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return await Cart.findById(cart._id).populate('items.productId');
  }

  async clearCart(userId: string) {
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      throw new AppError('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return cart;
  }
}

