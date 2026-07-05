import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderService } from '../order/order.service';
import { RefundService } from './refund.service';
import { ReconciliationService } from './reconciliation.service';

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
        private readonly reconciliation: ReconciliationService,
    ) { }

    @Get()
    list(@Req() req: any) {
        return this.orderService.getAllOrders(req.userId);
    }

    // Force a Printify reconciliation now (admin only). Syncs live-order status
    // + tracking and auto-refunds any order Printify has canceled. Useful when
    // webhooks can't reach this server (e.g. local dev). Returns a summary.
    @Post('reconcile')
    async reconcile(@Req() req: any) {
        await this.orderService.assertAdmin(req.userId);
        return this.reconciliation.reconcile();
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
