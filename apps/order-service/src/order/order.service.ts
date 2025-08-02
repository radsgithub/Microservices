import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface ProductServiceClient {
    FindProduct(data: any): Observable<any>;
    UpdateProduct(data: any): Observable<any>;
}
@Injectable()
export class OrderService {
    private productServiceClient!: ProductServiceClient;

    constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject('PRODUCT_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.productServiceClient = this.client.getService<ProductServiceClient>('ProductService');
    }

    async getOrdersByUser(userId: number) {
        return this.orderModel.find({ where: { userId } });
    }

    async getOrderById(id: number) {
        return this.orderModel.findById(id);
    }

    async updateOrderStatus(id: number, status: string) {
        const order = await this.orderModel.findById(id);
        if (order) {
            order.status = status;
            await order.save();
        }
        return order;
    }
}
