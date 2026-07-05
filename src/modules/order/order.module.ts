import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { UserModule } from '../user/user.module';

// Orders reference Printify products by id (no local Product/Cart). UserModule
// is needed for the admin role check. AuditModule is global.
@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService, MongooseModule],
})
export class OrderModule { }
