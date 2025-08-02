import { Inject, Injectable } from '@nestjs/common';
import { Cart } from "./schemas/cart.schema"
import { Order, OrderDocument } from "../order/schemas/order.schema"
import { InjectModel } from '@nestjs/mongoose';
import { CartDocument } from './schemas/cart.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateCartDto } from './dtos/create.dto';
import { lastValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface ProductServiceClient {
    FindOne(data: any): Observable<any>;
    UpdateOne(data: any): Observable<any>;
}
@Injectable()
export class CartService {
    private productServiceClient!: ProductServiceClient;

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject('PRODUCT_SERVICE') private client: ClientGrpc,

    ) { }

    onModuleInit() {
        this.productServiceClient = this.client.getService<ProductServiceClient>('ProductService');
    }
    async addToCart(body: CreateCartDto) {
        const formattedItems = await Promise.all(
            body.items.map(async (item) => {
                const product = await lastValueFrom(
                    this.productServiceClient.FindOne({ productId: item.productId })
                );

                const price = parseFloat(product.price);
                const quantity = item.quantity;
                const totalPrice = price * quantity;
                return {
                    productId: new Types.ObjectId(item.productId),
                    quantity,
                    totalPrice,
                };
            })
        );

        const userObjectId = new Types.ObjectId(body.userId);
        const existingCart = await this.cartModel.findOne({ userId: userObjectId });

        if (existingCart) {
            const itemMap = new Map<string, any>();

            // Use .toObject() to strip off Mongoose internals
            for (const item of existingCart.items) {
                itemMap.set(item.productId.toString(), item);
            }

            // Merge or add new items
            for (const newItem of formattedItems) {
                const idStr = newItem.productId.toString();
                if (itemMap.has(idStr)) {
                    const existing = itemMap.get(idStr);
                    existing.quantity += newItem.quantity;
                    existing.totalPrice += newItem.totalPrice;
                } else {
                    itemMap.set(idStr, newItem);
                }
            }
            const updatedItems = Array.from(itemMap.values());
            const updatedTotal = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
            existingCart.items = updatedItems;
            existingCart.totalPrice = existingCart.totalPrice + updatedTotal;

            return await existingCart.save();
        } else {
            const totalPrice = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);

            return this.cartModel.create({
                userId: userObjectId,
                items: formattedItems,
                totalPrice,
            });
        }
    }




    async getCart(userId: number) {
        return this.cartModel.findOne({ where: { userId } });
    }

    async checkout(userId: number) {
        const cart = await this.cartModel.findOne({ where: { userId } });
        if (!cart) return { message: 'Cart is empty' };

        const totalAmount = cart.items.reduce((sum, item: any) => sum + item.quantity * item.price, 0);
        const order = await this.orderModel.create({
            userId,
            items: cart.items,
            totalAmount,
            status: 'Pending',
        });

        await this.cartModel.updateOne({ userId }, { $set: { items: [] } });
        return order;
    }
}
