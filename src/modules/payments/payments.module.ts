import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Refund, RefundSchema } from './schemas/refund.schema';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';
import { StripeService } from './stripe.service';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { WebhookService } from './webhook.service';
import { WebhooksController } from './webhooks.controller';
import { RefundService } from './refund.service';
import { ReconciliationService } from './reconciliation.service';
import { AdminController } from './admin.controller';
import { OrderModule } from '../order/order.module';
import { PrintifyModule } from '../printify/printify.module';
import { PrintfulModule } from '../printful/printful.module';

import { UserModule } from '../user/user.module';

@Module({
    imports: [
        OrderModule, // provides OrderService + Order model
        PrintifyModule,
        PrintfulModule,
        UserModule,
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Refund.name, schema: RefundSchema },
            { name: WebhookEvent.name, schema: WebhookEventSchema },
        ]),
    ],
    controllers: [CheckoutController, WebhooksController, AdminController],
    providers: [StripeService, CheckoutService, WebhookService, RefundService, ReconciliationService],
    exports: [StripeService, MongooseModule],
})
export class PaymentsModule { }
