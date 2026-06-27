import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dtos/create.dto';
import { CartService } from '../cart/cart.service';
import { UserService } from '../user/user.service';
import { AddressService } from '../address/address.service';
import { ShippingService } from '../shipping/shipping.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private readonly cartService: CartService,
        private readonly userService: UserService,
        private readonly addressService: AddressService,
        private readonly shippingService: ShippingService,
    ) { }

    // Builds an order from the user's current cart, then clears the cart.
    async create(userId: string, dto: CreateOrderDto) {
        const cart: any = await this.cartService.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        const items = cart.items.map((it: any) => {
            const product = it.productId; // populated { _id, name, price, images }
            const price = typeof product === 'object' ? product.price ?? 0 : 0;
            const productId = typeof product === 'object' ? product._id : product;
            return {
                productId,
                quantity: it.quantity,
                size: it.size,
                color: it.color,
                price,
            };
        });

        const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
        const totalAmount = subtotal + (dto.shippingCost || 0);

        const order = await this.orderModel.create({
            userId,
            items,
            totalAmount,
            paymentMethod: 'COD',
            paymentStatus: 'pending', // collected on delivery
            shippingAddressId: dto.shippingAddressId,
            shippingCost: dto.shippingCost,
            shippingCourier: dto.shippingCourier,
            shippingServiceName: dto.shippingServiceName,
        });

        await this.cartService.clearCart(userId);
        return this.getById(userId, order._id.toString());
    }

    async getMyOrders(userId: string) {
        return this.orderModel
            .find({ userId })
            .populate('items.productId', 'name price images')
            .sort({ createdAt: -1 });
    }

    async getById(userId: string, id: string) {
        const order = await this.orderModel
            .findOne({ _id: id, userId })
            .populate('items.productId', 'name price images');
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    // ---- Admin -------------------------------------------------------------

    private async assertAdmin(userId: string) {
        const user: any = await this.userService.findById(userId);
        if (!user || user.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }
    }

    async getAllOrders(adminUserId: string) {
        await this.assertAdmin(adminUserId);
        return this.orderModel
            .find()
            .populate('items.productId', 'name price images')
            .sort({ createdAt: -1 });
    }

    private readonly validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    async updateStatus(adminUserId: string, orderId: string, status: string) {
        await this.assertAdmin(adminUserId);
        const normalized = (status || '').toLowerCase();
        if (!this.validStatuses.includes(normalized)) {
            throw new BadRequestException(
                `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`,
            );
        }
        const order = await this.orderModel.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus: normalized } },
            { new: true },
        ).populate('items.productId', 'name price images');
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    // Buys a shipping label for the order, saves the tracking number, and
    // marks the order as shipped. This is the "fulfillment" step (③).
    async fulfill(adminUserId: string, orderId: string) {
        await this.assertAdmin(adminUserId);

        const order = await this.orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.trackingNumber) {
            throw new BadRequestException('Order already fulfilled');
        }

        const address: any = order.shippingAddressId
            ? await this.addressService.findById(order.shippingAddressId.toString())
            : null;

        const to = address
            ? {
                name: 'Customer',
                street1: address.line1,
                street2: address.line2,
                city: address.city,
                state: address.state,
                zip: address.postalCode,
                country: (address.country || 'US').toUpperCase().startsWith('UNITED') ? 'US' : address.country,
            }
            : null;

        // Total weight: 0.5 lb per item (matches the checkout estimate).
        const totalQty = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
        const parcel = { length: 12, width: 9, height: 3, weight: Math.max(0.5, totalQty * 0.5) };

        const label = await this.shippingService.purchaseLabel(to, parcel);

        order.trackingNumber = label.trackingNumber;
        order.shippingLabelUrl = label.labelUrl;
        order.shippingCourier = label.courier;
        order.shippingServiceName = label.serviceName;
        order.orderStatus = 'shipped';
        await order.save();

        return order;
    }
}
