export type ProductCategory = 'electronics' | 'clothing' | 'home' | 'beauty' | 'toys';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  description?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  description?: string;
  stock?: number;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  image?: string;
  category?: ProductCategory;
  description?: string;
  stock?: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CreateOrderDto {
  items: CartItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface AppError extends Error {
  statusCode?: number;
}

