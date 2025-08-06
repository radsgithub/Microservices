import { Module } from '@nestjs/common';
import { OrderController, } from './order.controller';
import { OrderService, } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema, } from './schemas/order.schema';
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

    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
