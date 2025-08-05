import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { UpdateOrderDto } from './dtos/update.dto';

interface ProductServiceClient {
    FindProduct(data: any): Observable<any>;
    UpdateProduct(data: any): Observable<any>;
}

@Injectable()
export class OrderService {
    private productServiceClient!: ProductServiceClient;
    private readonly validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject('PRODUCT_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.productServiceClient = this.client.getService<ProductServiceClient>('ProductService');
    }

    async getOrdersByUser(userId: string) {
        return this.orderModel.find({ userId: new mongoose.Types.ObjectId(userId) });
    }

    async getOrderById(id: string) {
        return this.orderModel.findById(id);
    }

    async updateOrderStatus(id: string, body: UpdateOrderDto) {
        // Validate status
        const normalizedStatus = body.status.toLowerCase();
        if (!this.validStatuses.includes(normalizedStatus)) {
            throw new BadRequestException(`Invalid status. Must be one of: ${this.validStatuses.join(', ')}`);
        }

        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new BadRequestException('Order not found');
        }

        order.status = normalizedStatus;
        await order.save();
        return order;
    }
}
