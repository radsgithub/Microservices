import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  gocardlessAccessToken: process.env.GOCARDLESS_ACCESS_TOKEN || '',
  gocardlessEnvironment: (process.env.GOCARDLESS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'live',
  parcel2goApiUrl: process.env.PARCEL2GO_API_URL || 'https://api.parcel2go.com/v1',
  parcel2goApiKey: process.env.PARCEL2GO_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

