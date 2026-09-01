import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { }

    // Authorize: returns { orderId, clientSecret } for Stripe.js to confirm.
    @Post()
    start(@Req() req: any, @Body() body: CheckoutDto) {
        return this.checkoutService.start(req.userId, body);
    }

    // Confirm after payment is authorized: creates Printify order + captures.
    @Post(':orderId/confirm')
    confirm(@Req() req: any, @Param('orderId') orderId: string) {
        return this.checkoutService.confirm(req.userId, orderId);
    }

    // Refund a $1 test payment instantly (demo account only).
    @Post(':orderId/refund-test')
    refundTest(@Req() req: any, @Param('orderId') orderId: string) {
        return this.checkoutService.refundTest(req.userId, orderId);
    }
}
