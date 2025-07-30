import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb+srv://radhika:microservices@microservices.lpvgrrr.mongodb.net/user-db'),
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
