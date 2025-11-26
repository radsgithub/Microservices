import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { carts } from '../data/cart';
import { products } from '../data/products';
import { Cart, CartItem, AddToCartDto, UpdateCartItemDto, AppError } from '../types';

const router = Router();

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  return { subtotal, tax, total };
};

// GET /api/cart - Get cart
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = req.query.cartId as string || 'default';
    const cart = carts.get(cartId);
    
    if (!cart) {
      const error: AppError = new Error(`Cart with ID ${cartId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Recalculate totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;
    cart.updatedAt = new Date();
    
    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/items - Add item to cart
router.post('/items', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req.body.cartId as string) || 'default';
    const { productId, quantity }: AddToCartDto = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      const error: AppError = new Error('productId and quantity (greater than 0) are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Find product
    const product = products.find((p) => p.id === productId);
    if (!product) {
      const error: AppError = new Error(`Product with ID ${productId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Check stock
    if (product.stock !== undefined && product.stock < quantity) {
      const error: AppError = new Error(`Insufficient stock. Available: ${product.stock}`);
      error.statusCode = 400;
      throw error;
    }
    
    // Get or create cart
    let cart = carts.get(cartId);
    if (!cart) {
      cart = {
        id: cartId,
        items: [],
        subtotal: 0,
        shipping: 5.99,
        tax: 0,
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      carts.set(cartId, cart);
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      };
      cart.items.push(newItem);
    }
    
    // Recalculate totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;
    cart.updatedAt = new Date();
    
    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cart/items/:itemId - Update cart item quantity
router.put('/items/:itemId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const cartId = (req.body.cartId as string) || 'default';
    const { quantity }: UpdateCartItemDto = req.body;
    
    if (!quantity || quantity <= 0) {
      const error: AppError = new Error('quantity must be greater than 0');
      error.statusCode = 400;
      throw error;
    }
    
    const cart = carts.get(cartId);
    if (!cart) {
      const error: AppError = new Error(`Cart with ID ${cartId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      const error: AppError = new Error(`Cart item with ID ${itemId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Check stock
    const product = products.find((p) => p.id === cart.items[itemIndex].productId);
    if (product?.stock !== undefined && product.stock < quantity) {
      const error: AppError = new Error(`Insufficient stock. Available: ${product.stock}`);
      error.statusCode = 400;
      throw error;
    }
    
    cart.items[itemIndex].quantity = quantity;
    
    // Recalculate totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;
    cart.updatedAt = new Date();
    
    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const cartId = (req.query.cartId as string) || 'default';
    
    const cart = carts.get(cartId);
    if (!cart) {
      const error: AppError = new Error(`Cart with ID ${cartId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      const error: AppError = new Error(`Cart item with ID ${itemId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    cart.items.splice(itemIndex, 1);
    
    // Recalculate totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;
    cart.updatedAt = new Date();
    
    res.json({
      success: true,
      data: cart,
      message: `Cart item with ID ${itemId} removed successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req.query.cartId as string) || 'default';
    
    const cart = carts.get(cartId);
    if (!cart) {
      const error: AppError = new Error(`Cart with ID ${cartId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.total = 0;
    cart.updatedAt = new Date();
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

