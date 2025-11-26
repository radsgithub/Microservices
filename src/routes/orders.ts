import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orders } from '../data/orders';
import { carts } from '../data/cart';
import { Order, CreateOrderDto, AppError } from '../types';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = orders.find((o) => o.id === id);
    
    if (!order) {
      const error: AppError = new Error(`Order with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create a new order
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId, shippingAddress }: CreateOrderDto & { cartId?: string } = req.body;
    
    // Get cart items
    let orderItems;
    if (cartId) {
      const cart = carts.get(cartId);
      if (!cart || cart.items.length === 0) {
        const error: AppError = new Error('Cart is empty or not found');
        error.statusCode = 400;
        throw error;
      }
      orderItems = cart.items;
    } else if (req.body.items) {
      orderItems = req.body.items;
    } else {
      const error: AppError = new Error('Either cartId or items are required');
      error.statusCode = 400;
      throw error;
    }
    
    if (!orderItems || orderItems.length === 0) {
      const error: AppError = new Error('Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // Create order
    const newOrder: Order = {
      id: uuidv4(),
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      shippingAddress: shippingAddress || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    orders.push(newOrder);
    
    // Clear cart if cartId was provided
    if (cartId) {
      const cart = carts.get(cartId);
      if (cart) {
        cart.items = [];
        cart.subtotal = 0;
        cart.tax = 0;
        cart.total = 0;
        cart.updatedAt = new Date();
      }
    }
    
    res.status(201).json({
      success: true,
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      const error: AppError = new Error(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }
    
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      const error: AppError = new Error(`Order with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    orders[orderIndex].status = status as Order['status'];
    orders[orderIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      data: orders[orderIndex],
    });
  } catch (error) {
    next(error);
  }
});

export default router;

