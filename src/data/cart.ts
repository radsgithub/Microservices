import { Cart } from '../types';

// In-memory database - In production, this would be replaced with a real database
export const carts: Map<string, Cart> = new Map();

// Default cart for demo purposes
const defaultCart: Cart = {
  id: 'default',
  items: [],
  subtotal: 0,
  shipping: 5.99,
  tax: 0,
  total: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

carts.set('default', defaultCart);

