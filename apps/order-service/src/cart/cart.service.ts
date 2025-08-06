import { Inject, Injectable, BadRequestException } from '@nestjs/common';
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

interface UserServiceClient {
    findById(data: any): Observable<any>;
}
@Injectable()
export class CartService {
    private productServiceClient!: ProductServiceClient;
    private userServiceClient!: UserServiceClient

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject('PRODUCT_SERVICE') private client: ClientGrpc,
        @Inject('USER_SERVICE') private clientUser: ClientGrpc

    ) { }

    onModuleInit() {
        this.productServiceClient = this.client.getService<ProductServiceClient>('ProductService');
        this.userServiceClient = this.clientUser.getService<UserServiceClient>('UserService');
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
        let cart = await this.cartModel.findOne({ userId: userObjectId });

        if (cart) {
            const itemMap = new Map<string, any>();
            for (const item of cart.items) {
                itemMap.set(item.productId.toString(), item);
            }

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

            cart.items = updatedItems;
            cart.totalPrice += updatedTotal;
            await cart.save();
        } else {
            const totalPrice = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
            cart = await this.cartModel.create({
                userId: userObjectId,
                items: formattedItems,
                totalPrice,
            });
        }

        // 🟢 Now fetch live product details for response only
        const enrichedItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await lastValueFrom(
                    this.productServiceClient.FindOne({ productId: item.productId })
                );

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    totalPrice: product.totalPrice,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                };
            })
        );

        return {
            message: cart.isNew ? 'Cart created successfully' : 'Cart updated successfully',
            cart: {
                userId: cart.userId,
                items: enrichedItems,
                totalPrice: cart.totalPrice,
            },
        };
    }


    async getCart(userId: string) {
        const cart = await this.cartModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (cart) {
            const formattedItems = await Promise.all(
                cart.items.map(async (item) => {
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
                        name: product.name,
                        price: product.price,
                        stock: product.stock
                    };
                })
            );
            return {
                formattedItems, priceToPay: cart.totalPrice
            }
        }

        else {
            return { message: 'Cart is empty' };
        }
    }

    async checkout(userId: string) {
        const cart = await this.cartModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!cart) return { message: 'Cart is empty' };

        const totalAmount = cart.totalPrice
        const user = await lastValueFrom(
            this.userServiceClient.findById({ _id: new mongoose.Types.ObjectId(userId) })
        );
        const formattedItems = await Promise.all(
            cart.items.map(async (item) => {
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
                    name: product.name,
                    price: product.price,
                    stock: product.stock
                };
            })
        );
        const order = await this.orderModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            items: cart.items,
            totalAmount,
            status: 'pending',

        });
        await this.cartModel.updateOne({ userId: new mongoose.Types.ObjectId(userId) }, { $set: { items: [] } });

        return { ...order, user, formattedItems };
    }
}
