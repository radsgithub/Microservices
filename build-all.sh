#!/bin/bash

echo "🏗️  Building common library..."
cd libs/common
npm run build
cd ../..

echo "🏗️  Building auth-service..."
cd apps/auth-service
npm run build
cd ../..

echo "🏗️  Building user-service..."
cd apps/user-service
npm run build
cd ../..

echo "🏗️  Building product-service..."
cd apps/product-service
npm run build
cd ../..

echo "🏗️  Building order-service..."
cd apps/order-service
npm run build
cd ../..

echo "🏗️  Building notification-service..."
cd apps/notification-service
npm run build
cd ../..

echo "🏗️  Building api-gateway..."
cd apps/api.gateway
npm run build
cd ../..

echo "✅ All services built successfully!"
echo ""
echo "📁 Dist folder structures:"
echo "auth-service/dist: $(ls apps/auth-service/dist | head -5)"
echo "user-service/dist: $(ls apps/user-service/dist | head -5)"
echo "product-service/dist: $(ls apps/product-service/dist | head -5)"
echo "order-service/dist: $(ls apps/order-service/dist | head -5)" 