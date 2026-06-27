import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { AddressModule } from '../address/address.module';
import { ShippingModule } from '../shipping/shipping.module';

// Orders are built from the cart (CartModule). Fulfillment needs the admin's
// role (UserModule), the ship-to address (AddressModule), and label purchase
// (ShippingModule).
@Module({
    imports: [
        CartModule,
        UserModule,
        AddressModule,
        ShippingModule,
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
