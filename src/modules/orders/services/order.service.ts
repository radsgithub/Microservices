import { Order, IOrderItem } from '../models/Order.model';
import { Cart } from '../../cart/models/Cart.model';
import { Address } from '../../address/models/Address.model';
import { Product } from '../../products/models/Product.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface CreateOrderData {
  cartId?: string;
  shippingAddressId: string;
  aiPredictionId?: string;
  shippingCost?: number;
  shippingCourier?: string;
  shippingServiceName?: string;
}

export class OrderService {
  async createOrder(userId: string, data: CreateOrderData) {
    const { shippingAddressId, cartId, aiPredictionId, shippingCost, shippingCourier, shippingServiceName } = data;

    // Verify address belongs to user
    const address = await Address.findOne({
      _id: shippingAddressId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!address) {
      throw new AppError('Shipping address not found');
    }

    // Get cart items
    let cart;
    if (cartId) {
      cart = await Cart.findOne({
        _id: cartId,
        userId: new mongoose.Types.ObjectId(userId),
      }).populate('items.productId');
    } else {
      cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate(
        'items.productId'
      );
    }

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty');
    }

    // Build order items with current prices
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId as any;
      if (!product) {
        throw new AppError(`Product ${cartItem.productId} not found`);
      }

      // Verify stock
      if (product.stock < cartItem.quantity) {
        throw new AppError(`Insufficient stock for product ${product.name}`);
      }

      const itemPrice = product.price;
      const itemTotal = itemPrice * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: cartItem.productId as mongoose.Types.ObjectId,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        price: itemPrice,
      });
    }

    // Add shipping cost to total if provided
    if (shippingCost) {
      totalAmount += shippingCost;
    }

    // Create order
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingAddressId: new mongoose.Types.ObjectId(shippingAddressId),
      shippingCost,
      shippingCourier,
      shippingServiceName,
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    return await Order.findById(order._id)
      .populate('items.productId')
      .populate('shippingAddressId');
  }

  async getOrder(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate('items.productId')
      .populate('shippingAddressId');

    if (!order) {
      throw new AppError('Order not found');
    }

    return order;
  }

  async getMyOrders(userId: string) {
    return await Order.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('items.productId')
      .populate('shippingAddressId')
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(
    orderId: string,
    updates: {
      paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
      orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      gocardlessPaymentId?: string;
    }
  ) {
    const order = await Order.findByIdAndUpdate(orderId, { $set: updates }, { new: true })
      .populate('items.productId')
      .populate('shippingAddressId');

    if (!order) {
      throw new AppError('Order not found');
    }

    return order;
  }
}

