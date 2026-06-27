import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductModule } from '../product/product.module';

// ProductModule is imported so the Product model is available for populate().
@Module({
    imports: [
        ProductModule,
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
