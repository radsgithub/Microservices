# E-commerce Backend API

Backend application for e-commerce website with Express.js, TypeScript, MongoDB, JWT Authentication, and GoCardless payment integration.

## Features

- ✅ User Authentication (JWT)
- ✅ Product Management
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Address Management
- ✅ AI Module for size prediction and recommendations (placeholder)
- ✅ GoCardless Payment Integration
- ✅ Webhook support for payment status updates

## Tech Stack

- **Express.js** (TypeScript)
- **MongoDB** + **Mongoose**
- **JWT** Authentication
- **GoCardless API** for payments
- **bcryptjs** for password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
GOCARDLESS_ACCESS_TOKEN=your-gocardless-access-token
GOCARDLESS_ENVIRONMENT=sandbox
CORS_ORIGIN=http://localhost:3000
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/update` - Update user profile (protected)

### Address
- `POST /api/address/add` - Add address (protected)
- `GET /api/address/list` - List user addresses (protected)
- `PUT /api/address/update/:id` - Update address (protected)
- `DELETE /api/address/:id` - Delete address (protected)

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/update/:itemId` - Update cart item (protected)
- `DELETE /api/cart/remove/:itemId` - Remove cart item (protected)

### AI
- `POST /api/ai/predict` - Get AI predictions (protected)
- `GET /api/ai/history` - Get prediction history (protected)
- `GET /api/ai/:id` - Get prediction by ID (protected)

### Orders
- `POST /api/order/create` - Create order (protected)
- `GET /api/order/:id` - Get order by ID (protected)
- `GET /api/order/my` - Get user orders (protected)

### Payments
- `POST /api/payments/create-mandate` - Create GoCardless mandate (protected)
- `POST /api/payments/create-order-payment` - Create payment for order (protected)
- `POST /api/payments/webhooks` - GoCardless webhook handler

## Project Structure

```
src/
  config/
    db.ts              # MongoDB connection
    gocardless.ts      # GoCardless client
    env.ts             # Environment configuration
  modules/
    auth/              # Authentication module
    users/             # User management
    products/          # Product management
    cart/              # Shopping cart
    orders/            # Order management
    payments/          # Payment processing
    ai/                # AI predictions
    address/           # Address management
  middleware/
    auth.ts            # JWT authentication middleware
    errorHandler.ts    # Error handling middleware
  utils/
    logger.ts          # Logging utility
  app.ts               # Express app setup
  server.ts            # Server entry point
```

## Notes

- The AI module currently uses placeholder logic. Replace the `predictSizeAndRecommendations` function in `src/modules/ai/services/ai.service.ts` with your actual AI/ML model.
- GoCardless integration requires valid credentials. Set up your GoCardless account and configure the access token in `.env`.
- All protected routes require a JWT token in the `Authorization` header: `Bearer <token>`

