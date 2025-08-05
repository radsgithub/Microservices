# E-commerce Microservices

A comprehensive microservices architecture for e-commerce built with NestJS, featuring shared common libraries and clean build outputs.

## 🏗️ Architecture

- **auth-service** (Port 3000) - Authentication and authorization
- **user-service** (Port 3001) - User management with gRPC
- **product-service** (Port 3002) - Product catalog with gRPC
- **order-service** (Port 3003) - Order and cart management
- **notification-service** - Kafka-based notifications (requires Kafka)
- **api-gateway** (Port 8000) - API documentation aggregator

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Kafka (optional, for notifications)

### One-Command Setup

```bash
# Start all services
./start-all.sh start

# Check service status
./start-all.sh status

# Stop all services
./start-all.sh stop

# Restart all services
./start-all.sh restart
```

### Manual Setup

```bash
# Build all services
./build-all.sh

# Or build individual services
cd apps/auth-service && npm run build
cd apps/user-service && npm run build
cd apps/product-service && npm run build
cd apps/order-service && npm run build
cd apps/notification-service && npm run build
cd apps/api.gateway && npm run build
```

## 📚 API Documentation

Once all services are running, you can access the API documentation:

- **API Gateway**: http://localhost:8000/api-docs
- **Auth Service**: http://localhost:3000/api-docs/auth-service
- **User Service**: http://localhost:3001/api-docs/user-service
- **Product Service**: http://localhost:3002/api-docs/product-service
- **Order Service**: http://localhost:3003/api-docs/order-service

## 🛠️ Scripts

### `start-all.sh`
Comprehensive script to manage all services:

```bash
./start-all.sh start    # Start all services
./start-all.sh stop     # Stop all services
./start-all.sh restart  # Restart all services
./start-all.sh status   # Show service status
./start-all.sh logs <service>  # Show logs for specific service
./start-all.sh build    # Build all services
```

### `build-all.sh`
Build all services and the common library:

```bash
./build-all.sh
```

## 📁 Project Structure

```
├── apps/
│   ├── auth-service/      # Authentication service
│   ├── user-service/      # User management service
│   ├── product-service/   # Product catalog service
│   ├── order-service/     # Order management service
│   ├── notification-service/  # Kafka notification service
│   └── api.gateway/       # API documentation gateway
├── libs/
│   └── common/            # Shared common library
│       ├── interceptors/  # Common interceptors
│       └── dist/          # Compiled common library
├── start-all.sh           # Service management script
├── build-all.sh           # Build script
└── logs/                  # Service logs (created automatically)
```

## 🔧 Common Library

The `libs/common` folder contains shared utilities used across all services:

- **ResponseInterceptor** - Standardizes API response format
- **AllExceptionsFilter** - Global exception handling

All services import these from `@common/*` which maps to the compiled library.

## 🐳 Docker Support

For containerized deployment, each service includes a Dockerfile:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📝 Development

### Adding New Services

1. Create service in `apps/` directory
2. Update `start-all.sh` with new service details
3. Add service to `build-all.sh`
4. Update API Gateway if needed

### Adding Common Utilities

1. Add files to `libs/common/`
2. Export from `libs/common/index.ts`
3. Rebuild common library: `cd libs/common && npm run build`
4. Import in services using `@common/*`

## 🔍 Troubleshooting

### Service Won't Start
- Check if port is already in use: `lsof -i :<port>`
- Check logs: `./start-all.sh logs <service-name>`
- Verify MongoDB connection

### Build Issues
- Clean and rebuild: `./start-all.sh stop && ./build-all.sh && ./start-all.sh start`
- Check TypeScript errors in individual services

### Notification Service
- Requires Kafka to be running
- Start manually: `cd apps/notification-service && npm start`
- Or use Docker Compose for full stack

## 📊 Monitoring

- Service status: `./start-all.sh status`
- Individual logs: `./start-all.sh logs <service-name>`
- All logs stored in `logs/` directory