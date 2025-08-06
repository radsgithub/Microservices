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


}
