import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

// Was: ClientsModule.register (gRPC USER_SERVICE) + KafkaModule.
// Now: import the modules that export UserService and NotificationService.
@Module({
    imports: [UserModule, NotificationModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule { }
