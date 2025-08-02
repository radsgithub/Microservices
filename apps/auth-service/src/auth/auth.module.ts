import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
@Module({

    imports: [ClientsModule.register([
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

        KafkaModule
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule { }
