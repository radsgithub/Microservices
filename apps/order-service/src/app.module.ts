import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // makes env vars available globally
            envFilePath: ['../../.env'],
        }),
        MongooseModule.forRoot(`${process.env.MONGO_DB_URL}/order-db`),
        OrderModule, CartModule,
        ClientsModule.register([
            {
                name: 'PRODUCT_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    package: 'product',
                    protoPath: join(__dirname, 'proto/product.proto'),
                },
            },
        ]),
    ],
})
export class AppModule { }