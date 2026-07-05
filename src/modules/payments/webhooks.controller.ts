import { BadRequestException, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';

// PUBLIC endpoints (no JwtAuthGuard) — called by Stripe/Printify servers.
// Authenticity is proven by signature verification, not a login token.
@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
    constructor(
        private readonly stripe: StripeService,
        private readonly webhooks: WebhookService,
    ) { }

    @Post('stripe')
    async handleStripe(@Req() req: any, @Headers('stripe-signature') signature: string) {
        if (!req.rawBody) throw new BadRequestException('Missing body');
        let event: Stripe.Event;
        try {
            event = this.stripe.constructEvent(req.rawBody, signature);
        } catch {
            throw new BadRequestException('Invalid Stripe signature');
        }
        await this.webhooks.processStripe(event);
        return { received: true };
    }

    @Post('printify')
    async handlePrintify(@Req() req: any, @Headers('x-pfy-signature') signature: string) {
        if (!this.webhooks.verifyPrintify(req.rawBody, signature)) {
            throw new BadRequestException('Invalid Printify signature');
        }
        await this.webhooks.processPrintify(req.body);
        return { received: true };
    }
}
