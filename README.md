# E-commerce Monolith

A **monolithic** NestJS app converted from the microservices under `../apps`.
Everything that used to be a separate service now runs in one process, on one
port, against one database.

## Run

```bash
npm install
# needs MongoDB — defaults to mongodb://localhost:27017/ecommerce-monolith (edit .env)
npm run start:dev      # watch mode
# or
npm run build && npm run start:prod
```

- API:       http://localhost:8002
- Swagger:   http://localhost:8002/api-docs

## What changed vs. the microservices

| Microservices | Monolith |
|---|---|
| 6 services + api-gateway, each on its own port | 1 NestJS app on port 8002 |
| Per-service DBs (auth-db, user-db, product-db, order-db) | 1 database (`MONGO_URI`) |
| **gRPC** auth → user (`CreateUser`/`FindUser`) | `AuthService` injects `UserService` and calls it directly |
| **gRPC** order/cart → product, user (`FindOne`) | `OrderService`/`CartService` inject `ProductService` + `UserService` |
| **Kafka** auth → notification (`user-login`) | `AuthService` calls `NotificationService.handleUserLogin()` in-process |
| api-gateway aggregates per-service Swagger | one unified Swagger doc |
| `@common/*` shared lib (compiled) | `src/common/*` (source) |

The `.proto` files, `@nestjs/microservices`, `kafkajs`, `@grpc/*`,
`docker-compose.yml`, `nginx`, and the `start-all.sh` scripts are no longer
needed and are not part of this folder.

## Structure

```
src/
  main.ts                # single bootstrap: CORS, ValidationPipe, interceptor, filter, Swagger
  app.module.ts          # ConfigModule + single MongooseModule.forRoot + all feature modules
  common/interceptors/   # ResponseInterceptor + AllExceptionsFilter (from libs/common)
  modules/
    auth/                # /auth/register, /auth/login, /auth/validate
    user/                # /users/:id (+ addresses)   ← was root-path gRPC service
    product/             # /products
    order/               # /orders
    cart/                # /cart
    notification/        # in-process NotificationService (was Kafka consumer)
```

## Notes / behavior changes

- **User REST routes are now under `/users`** (the microservice used the root
  path because it had its own port; namespacing avoids route collisions).
- **The gRPC `@GrpcMethod` handlers were removed** — callers use the services
  directly, so they were redundant.
- **A global `ValidationPipe` is now enabled** in `main.ts`. The microservices
  declared `class-validator` DTOs but never wired a pipe, so validation was not
  actually enforced; the monolith enforces it. Remove the `useGlobalPipes` line
  in `main.ts` if you want the old (unvalidated) behavior.
- `cart.checkout` now uses `UserService.findById` (the old gRPC client called a
  `findById` rpc that didn't exist in the proto).
```
