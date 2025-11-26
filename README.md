# Glowtika E-commerce Backend API

A RESTful API backend for the Glowtika e-commerce application built with Express.js and TypeScript.

## Features

- ✅ Product management (CRUD operations)
- ✅ Shopping cart functionality
- ✅ Order management
- ✅ TypeScript for type safety
- ✅ Error handling middleware
- ✅ CORS support
- ✅ RESTful API design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Products

- `GET /api/products` - Get all products (optional query: `?category=electronics`)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Cart

- `GET /api/cart?cartId=default` - Get cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update cart item quantity
- `DELETE /api/cart/items/:itemId?cartId=default` - Remove item from cart
- `DELETE /api/cart?cartId=default` - Clear entire cart

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status

## Example Requests

### Create a Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "New Product",
  "price": 99.99,
  "image": "https://example.com/image.jpg",
  "category": "electronics",
  "description": "Product description",
  "stock": 100
}
```

### Add Item to Cart
```bash
POST /api/cart/items
Content-Type: application/json

{
  "cartId": "default",
  "productId": "1",
  "quantity": 2
}
```

### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "cartId": "default",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── data/          # In-memory data stores
│   ├── middleware/    # Express middleware
│   ├── routes/        # API route handlers
│   ├── types/         # TypeScript type definitions
│   └── server.ts      # Main server file
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- This implementation uses in-memory storage for simplicity. In production, you would replace this with a database (MongoDB, PostgreSQL, etc.).
- The cart system uses a default cart ID. In a real application, you would associate carts with user sessions or authentication.

## License

ISC

