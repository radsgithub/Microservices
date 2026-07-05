import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderService } from '../order/order.service';
import { RefundService } from './refund.service';

// Admin-only order management (list + refunds). Order-status changes stay on
// the existing /order/:id/status route.
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/orders')
export class AdminController {
    constructor(
        private readonly orderService: OrderService,
        private readonly refundService: RefundService,
    ) { }

    @Get()
    list(@Req() req: any) {
        return this.orderService.getAllOrders(req.userId);
    }

    @Get(':id/refunds')
    refundsForOrder(@Req() req: any, @Param('id') id: string) {
        return this.refundService.listForOrder(req.userId, id);
    }

    // Body: { amountCents?, reason? }. Omit amountCents for a full refund.
    @Post(':id/refund')
    refund(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { amountCents?: number; reason?: string },
    ) {
        return this.refundService.refund(req.userId, id, body?.amountCents, body?.reason);
    }
}
