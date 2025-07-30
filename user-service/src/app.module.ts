import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // makes env vars available globally
            envFilePath: ['../.env'],
        }),
        MongooseModule.forRoot(`${process.env.MONGO_DB_URL}/user-db`),
        UserModule,

        ClientsModule.register([
            {
                name: 'USER_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    package: 'user',
                    protoPath: join(__dirname, './proto/user.proto'),
                },
            },
        ]),
    ],
})
export class AppModule { }
