import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { AddressModule } from './modules/address/address.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { ProductionModule } from './modules/production/production.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        // One connection / one database for the whole app (replaces the
        // separate auth-db / user-db / product-db / order-db connections).
        MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb+srv://Radhika:JbSmlpFkj762qG48@microservices.lpvgrrr.mongodb.net/ecommerce?retryWrites=true&w=majority',
        ),

        // Feature modules — all previously separate services, now in-process.
        UserModule,
        ProductModule,
        AuthModule,
        OrderModule,
        CartModule,
        AddressModule,
        ShippingModule,
        ProductionModule,
        NotificationModule,
    ],
})
export class AppModule { }
