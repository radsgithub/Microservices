import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Order")
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get(':userId')
    getOrdersByUser(@Param('userId') userId: number) {
        return this.orderService.getOrdersByUser(userId);
    }

    @Get('detail/:id')
    getOrderById(@Param('id') id: number) {
        return this.orderService.getOrderById(id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: number, @Body('status') status: string) {
        return this.orderService.updateOrderStatus(id, status);
    }
}
