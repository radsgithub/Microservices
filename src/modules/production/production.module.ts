import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ProductionBatch, ProductionBatchSchema } from './schemas/production-batch.schema';
import { FabricInventory, FabricInventorySchema } from './schemas/fabric-inventory.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([
            { name: ProductionBatch.name, schema: ProductionBatchSchema },
            { name: FabricInventory.name, schema: FabricInventorySchema },
            { name: Order.name, schema: OrderSchema },
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
    controllers: [ProductionController],
    providers: [ProductionService],
})
export class ProductionModule { }
