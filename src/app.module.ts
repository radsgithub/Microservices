import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditModule } from './common/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AddressModule } from './modules/address/address.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { NotificationModule } from './modules/notification/notification.module';
import { requireEnv } from './common/config/env';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        // One connection / one database. The URI MUST come from the environment
        // (no hardcoded credentials fallback).
        MongooseModule.forRootAsync({
            useFactory: () => ({ uri: requireEnv('MONGO_URI') }),
        }),

        // Global audit-logging (order/payment/refund trail).
        AuditModule,

        // Feature modules. Products come from Printify (no local Product/Cart).
        UserModule,
        AuthModule,
        OrderModule,
        PaymentsModule,
        AddressModule,
        ShippingModule,
        NotificationModule,
    ],
})
export class AppModule { }
