import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { CheckoutService } from './checkout.service';
import { RefundService } from './refund.service';
import { AuditService } from '../../common/audit/audit.service';

export interface ReconcileSummary {
    checked: number;   // orders inspected
    updated: number;   // orders whose status/tracking changed via Printify sync
    refunded: number;  // orders auto-refunded because Printify canceled them
}

// PULL-BASED SAFETY NET.
//
// Webhooks can be missed — not registered, unreachable in local dev, or simply
// never emitted (Printify doesn't reliably notify on draft cancellations). When
// that happens our database drifts: it can say "in_production" while Printify
// has actually CANCELED the order, leaving a customer charged for something that
// will never ship.
//
// This job periodically asks Printify for the authoritative status of every
// live order and:
//   (a) syncs status + tracking into our DB, and
//   (b) auto-refunds any order Printify canceled while we already captured money.
@Injectable()
export class ReconciliationService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('Reconciliation');
    private timer?: ReturnType<typeof setInterval>;
    private bootTimer?: ReturnType<typeof setTimeout>;
    private running = false;

    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        private readonly checkout: CheckoutService,
        private readonly refunds: RefundService,
        private readonly audit: AuditService,
    ) { }

    onModuleInit() {
        if (process.env.RECONCILE_ENABLED === 'false') {
            this.logger.log('Disabled (RECONCILE_ENABLED=false)');
            return;
        }
        const minutes = Math.max(1, Number(process.env.RECONCILE_INTERVAL_MIN) || 15);
        // Self-heal shortly after boot (covers anything missed while offline),
        // then on a fixed interval.
        this.bootTimer = setTimeout(() => { void this.runSafely(); }, 15_000);
        this.timer = setInterval(() => { void this.runSafely(); }, minutes * 60_000);
        this.logger.log(`Enabled — every ${minutes} min`);
    }

    onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
        if (this.bootTimer) clearTimeout(this.bootTimer);
    }

    // Guard against overlapping runs: a slow run must finish before the next.
    private async runSafely() {
        if (this.running) return;
        this.running = true;
        try {
            const summary = await this.reconcile();
            if (summary.updated || summary.refunded) {
                this.logger.warn(
                    `checked ${summary.checked}, updated ${summary.updated}, auto-refunded ${summary.refunded}`,
                );
            }
        } catch (err) {
            this.logger.error(`Run failed: ${err instanceof Error ? err.message : err}`);
        } finally {
            this.running = false;
        }
    }

    // Reconcile every live order against Printify. Returns a summary. Safe to
    // call on demand (admin endpoint) — one order failing never aborts the batch.
    async reconcile(): Promise<ReconcileSummary> {
        const orders = await this.orderModel
            .find({
                printifyOrderId: { $exists: true, $nin: [null, ''] },
                orderStatus: { $in: ['in_production', 'shipped'] },
            })
            .limit(200);

        let updated = 0;
        let refunded = 0;

        for (const order of orders) {
            const before = order.orderStatus;
            try {
                // 1) Pull authoritative status + tracking into our DB.
                await this.checkout.syncPrintifyOrder(order.printifyOrderId!);

                const fresh = await this.orderModel.findById(order._id);
                if (!fresh) continue;
                if (fresh.orderStatus !== before) updated++;

                // 2) Printify canceled it but we captured the money → refund.
                if (
                    fresh.orderStatus === 'canceled' &&
                    fresh.paymentStatus === 'captured' &&
                    (fresh.refundedCents || 0) < fresh.totalCents
                ) {
                    await this.refunds.systemRefund(
                        fresh,
                        'Printify canceled the order — automatic refund',
                    );
                    refunded++;
                    await this.audit.log({
                        action: 'reconcile.auto_refunded',
                        level: 'warn',
                        message: `Order ${fresh._id} was canceled on Printify; customer auto-refunded ${fresh.totalCents} ${fresh.currency}.`,
                        orderId: fresh._id.toString(),
                    });
                }
            } catch (err) {
                await this.audit.log({
                    action: 'reconcile.order_error',
                    level: 'error',
                    message: `Reconcile failed for order ${order._id}: ${err instanceof Error ? err.message : err}`,
                    orderId: order._id.toString(),
                });
            }
        }

        return { checked: orders.length, updated, refunded };
    }
}
