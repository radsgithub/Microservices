import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from './dtos/create.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Matches the frontend contract: /order/create, /order/my, /order/:id.
@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('create')
    create(@Req() req: any, @Body() body: CreateOrderDto) {
        return this.orderService.create(req.userId, body);
    }

    // NOTE: literal segments ('my', 'admin') must be declared before ':id'
    // so they aren't captured as an id.
    @Get('my')
    getMyOrders(@Req() req: any) {
        return this.orderService.getMyOrders(req.userId);
    }

    // Admin: list every order (for the fulfillment dashboard).
    @Get('admin/all')
    getAllOrders(@Req() req: any) {
        return this.orderService.getAllOrders(req.userId);
    }

    // Admin: buy the shipping label + mark the order shipped.
    @Post(':id/fulfill')
    fulfill(@Req() req: any, @Param('id') id: string) {
        return this.orderService.fulfill(req.userId, id);
    }

    // Admin: manually change the order status.
    @Post(':id/status')
    updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
        return this.orderService.updateStatus(req.userId, id, body?.status);
    }

    @Get(':id')
    getOrder(@Req() req: any, @Param('id') id: string) {
        return this.orderService.getById(req.userId, id);
    }
}
