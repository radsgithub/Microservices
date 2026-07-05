import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Read + admin endpoints. Order CREATION now happens through the Stripe
// checkout flow (PaymentsModule), not here. Fulfillment is via Printify.
@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // Literal segments ('my', 'admin') declared before ':id'.
    @Get('my')
    getMyOrders(@Req() req: any) {
        return this.orderService.getMyOrders(req.userId);
    }

    // Admin: list every order (fulfillment dashboard).
    @Get('admin/all')
    getAllOrders(@Req() req: any) {
        return this.orderService.getAllOrders(req.userId);
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
