import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/users/routes/user.routes';
import addressRoutes from './modules/address/routes/address.routes';
import productRoutes from './modules/products/routes/product.routes';
import cartRoutes from './modules/cart/routes/cart.routes';
import aiRoutes from './modules/ai/routes/ai.routes';
import orderRoutes from './modules/orders/routes/order.routes';
import paymentRoutes from './modules/payments/routes/payment.routes';
import shippingRoutes from './modules/shipping/routes/shipping.routes';
import productionRoutes from './modules/production/routes/production.routes';

const app: Application = express();

// Middleware - CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Log for debugging
    logger.info(`CORS check - Origin: ${origin || 'no origin'}, CORS_ORIGIN env: ${config.corsOrigin}`);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      logger.info('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Parse CORS_ORIGIN - can be comma-separated list
    const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim()).filter((o) => o.length > 0);

    logger.info(`CORS: Allowed origins: ${JSON.stringify(allowedOrigins)}`);

    // Check if origin matches (exact match or wildcard)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      logger.info(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      // Also check if origin matches without trailing slash
      const originNoSlash = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      const matched = allowedOrigins.some(allowed => {
        const allowedNoSlash = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
        return originNoSlash === allowedNoSlash;
      });

      if (matched) {
        logger.info(`CORS: Allowing origin (after slash normalization): ${origin}`);
        callback(null, true);
      } else {
        logger.warn(`CORS: BLOCKED origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/production', productionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

