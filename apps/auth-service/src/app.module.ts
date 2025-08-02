import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.GRPC,
                options: {
                    package: 'user',
                    protoPath: join(__dirname, 'proto/user.proto'),
                    url: 'localhost:50051',
                },
            },
        ]),
        ConfigModule.forRoot({
            isGlobal: true, // makes env vars available globally
            envFilePath: ['../../.env'],
        }),
        // MongooseModule.forRoot('mongodb://mongodb-auth:27017/auth-db'),
        MongooseModule.forRoot(`${process.env.MONGO_DB_URL}/auth-db`),

        AuthModule,
    ],
})
export class AppModule { }
