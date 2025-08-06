import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo, ObjectId } from 'mongoose';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { UpdateOrderDto } from './dtos/update.dto';

interface ProductServiceClient {
    FindOne(data: any): Observable<any>;
    UpdateProduct(data: any): Observable<any>;
}

interface UserServiceClient {
    FindOne(data: { _id: any }): Observable<any>;
}

@Injectable()
export class OrderService {
    private productServiceClient!: ProductServiceClient;
    private userServiceClient!: UserServiceClient;

    private readonly validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject('PRODUCT_SERVICE') private client: ClientGrpc,
        @Inject('USER_SERVICE') private userClient: ClientGrpc

    ) { }

    onModuleInit() {
        this.productServiceClient = this.client.getService<ProductServiceClient>('ProductService');
        this.userServiceClient = this.userClient.getService<UserServiceClient>('UserService');

    }


    private async enrichOrder(order: OrderDocument) {
        console.log({ userId: new mongoose.Types.ObjectId(order.userId) })

        const user = await lastValueFrom(
            this.userServiceClient.FindOne({ _id: new mongoose.Types.ObjectId(order.userId) })
        );
        const enrichedItems = await Promise.all(
            order.items.map(async (item: any) => {
                const product = await lastValueFrom(
                    this.productServiceClient.FindOne({ productId: new mongoose.Types.ObjectId(item.productId) })
                );
                return {
                    ...item.toObject(),
                    product,
                };
            })
        );
        return {
            ...order.toObject(),
            user,
            items: enrichedItems,
        };
    }


    async getOrdersByUser(userId: string) {

        const orders = await this.orderModel.find({ userId: new mongoose.Types.ObjectId(userId) });
        console.log(orders)
        return Promise.all(orders.map((order) => this.enrichOrder(order)));
    }


    async getOrderById(id: string) {
        const order = await this.orderModel.findById(id);
        if (!order) throw new BadRequestException('Order not found');
        return this.enrichOrder(order);
    }


    async updateOrderStatus(id: string, body: UpdateOrderDto) {
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
        return this.enrichOrder(order);
    }

}
