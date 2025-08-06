import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(__dirname, '../proto/product.proto'),
          url: 'localhost:50052',
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../proto/user.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }, { name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule { }
