import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Order, OrderDocument, ORDER_STATUSES, OrderStatus } from './schemas/order.schema';
import { UserService } from '../user/user.service';
import { AuditService } from '../../common/audit/audit.service';

// Data needed to create an order record. Amounts are in minor units (cents)
// and are validated/priced server-side by the checkout flow before this runs.
export interface CreateOrderData {
    userId: string;
    items: {
        printifyProductId: string;
        printifyVariantId: number;
        name: string;
        variantLabel?: string;
        quantity: number;
        unitPriceCents: number;
        image?: string;
    }[];
    subtotalCents: number;
    shippingCents?: number;
    totalCents: number;
    currency: string;
    shippingAddress: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address1: string;
        address2?: string;
        city: string;
        region: string;
        zip: string;
        country: string;
    };
}

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        private readonly userService: UserService,
        private readonly audit: AuditService,
    ) { }

    // Creates the order in the 'created' state. Called by the checkout flow
    // (PaymentsModule) once pricing is validated. Supports a Mongo transaction
    // session so it can be atomic with the Payment record.
    async create(data: CreateOrderData, session?: ClientSession): Promise<OrderDocument> {
        const docs = await this.orderModel.create(
            [
                {
                    userId: data.userId,
                    items: data.items,
                    subtotalCents: data.subtotalCents,
                    shippingCents: data.shippingCents ?? 0,
                    totalCents: data.totalCents,
                    currency: data.currency,
                    orderStatus: 'created',
                    paymentStatus: 'pending',
                    shippingAddress: data.shippingAddress,
                },
            ],
            session ? { session } : {},
        );
        const order = docs[0];
        await this.audit.log({
            action: 'order.created',
            message: `Order ${order._id} created`,
            orderId: order._id.toString(),
            userId: data.userId,
            meta: { totalCents: data.totalCents, currency: data.currency },
        });
        return order;
    }

    async getMyOrders(userId: string) {
        return this.orderModel.find({ userId }).sort({ createdAt: -1 });
    }

    async getById(userId: string, id: string) {
        const order = await this.orderModel.findOne({ _id: id, userId });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // ---- Admin -------------------------------------------------------------

    async assertAdmin(userId: string) {
        const user: any = await this.userService.findById(userId);
        if (!user || user.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }
    }

    async getAllOrders(adminUserId: string) {
        await this.assertAdmin(adminUserId);
        return this.orderModel.find().sort({ createdAt: -1 });
    }

    async updateStatus(adminUserId: string, orderId: string, status: string) {
        await this.assertAdmin(adminUserId);
        const normalized = (status || '').toLowerCase() as OrderStatus;
        if (!ORDER_STATUSES.includes(normalized)) {
            throw new BadRequestException(
                `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`,
            );
        }
        const order = await this.orderModel.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus: normalized } },
            { new: true },
        );
        if (!order) throw new NotFoundException('Order not found');
        await this.audit.log({
            action: 'order.status_changed',
            message: `Order ${orderId} status -> ${normalized} (admin ${adminUserId})`,
            orderId,
            userId: adminUserId,
        });
        return order;
    }
}
