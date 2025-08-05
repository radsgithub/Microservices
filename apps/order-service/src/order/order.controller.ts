import { Body, Controller, Get, Param, Post, Put, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';
import { Order } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateOrderDto, } from './dtos/update.dto';

@ApiTags("Order")
@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        @InjectModel(Order.name) private orderModel: Model<Order>
    ) { }

    @Get(':userId')
    getOrdersByUser(@Param('userId') userId: string) {
        return this.orderService.getOrdersByUser(userId);
    }

    @Get('detail/:id')
    getOrderById(@Param('id') id: string) {
        return this.orderService.getOrderById(id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: UpdateOrderDto) {
        return this.orderService.updateOrderStatus(id, body);
    }

    @Post('test-validation')
    async testValidation(@Body() orderData: any) {
        // This will trigger validation error if status is invalid
        const order = new this.orderModel(orderData);
        return await order.save();
    }

    @Post('test-error')
    async testError() {
        // Create an order with invalid status to test exception filter
        const order = new this.orderModel({
            userId: '507f1f77bcf86cd799439011',
            items: [{ productId: '507f1f77bcf86cd799439012', quantity: 2 }],
            totalAmount: 100,
            status: 'InvalidStatus', // This should trigger validation error
            paymentMethod: 'credit_card'
        });
        return await order.save();
    }
}
