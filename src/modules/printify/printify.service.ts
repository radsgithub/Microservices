import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { requireEnv } from '../../common/config/env';

const PRINTIFY_BASE_URL = 'https://api.printify.com/v1';

interface PrintifyVariant {
    id: number;
    price: number; // cents
    title: string;
    is_enabled: boolean;
}
interface PrintifyImage { src: string; is_default: boolean; }
interface PrintifyProduct {
    id: string;
    title: string;
    images: PrintifyImage[];
    variants: PrintifyVariant[];
}
interface PrintifyListResponse { data: PrintifyProduct[] }

export interface CheckoutItemInput {
    productId: string;
    variantId: number;
    quantity: number;
}

export interface PricedLine {
    printifyProductId: string;
    printifyVariantId: number;
    name: string;
    variantLabel?: string;
    quantity: number;
    unitPriceCents: number;
    image?: string;
}

export interface PricedOrder {
    lines: PricedLine[];
    subtotalCents: number;
}

export interface PrintifyAddressTo {
    first_name: string; last_name: string; email: string; phone: string;
    country: string; region: string; address1: string; address2?: string;
    city: string; zip: string;
}

@Injectable()
export class PrintifyService {
    private token() { return requireEnv('PRINTIFY_API_TOKEN'); }
    private shopId() { return requireEnv('PRINTIFY_SHOP_ID'); }

    private async api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
        const res = await fetch(`${PRINTIFY_BASE_URL}${path}`, {
            method: init?.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${this.token()}`,
                'Content-Type': 'application/json',
                'User-Agent': 'VAID/1.0',
            },
            body: init?.body ? JSON.stringify(init.body) : undefined,
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new InternalServerErrorException(
                `Printify ${res.status} on ${path}: ${text.slice(0, 300)}`,
            );
        }
        return (await res.json()) as T;
    }

    private async fetchAllProducts(): Promise<PrintifyProduct[]> {
        const shopId = this.shopId();
        const all: PrintifyProduct[] = [];
        for (let page = 1; page < 100; page++) {
            const res = await this.api<PrintifyListResponse>(
                `/shops/${shopId}/products.json?limit=50&page=${page}`,
            );
            const batch = res.data ?? [];
            all.push(...batch);
            if (batch.length < 50) break;
        }
        return all;
    }

    // Authoritative server-side pricing. Validates each cart item against the
    // live Printify catalog and returns priced line snapshots. Never trusts a
    // price sent by the client.
    async priceOrder(items: CheckoutItemInput[]): Promise<PricedOrder> {
        if (!items || items.length === 0) {
            throw new BadRequestException('Cart is empty.');
        }
        const products = await this.fetchAllProducts();
        const index = new Map<number, { product: PrintifyProduct; variant: PrintifyVariant }>();
        for (const p of products) {
            for (const v of p.variants ?? []) index.set(v.id, { product: p, variant: v });
        }

        const lines: PricedLine[] = [];
        let subtotalCents = 0;
        for (const item of items) {
            const found = index.get(item.variantId);
            if (!found || found.product.id !== item.productId) {
                throw new BadRequestException(
                    `Item ${item.productId}/${item.variantId} is no longer available.`,
                );
            }
            const quantity = Math.max(1, Math.floor(item.quantity));
            const unitPriceCents = found.variant.price;
            subtotalCents += unitPriceCents * quantity;
            const defaultImg = [...(found.product.images ?? [])].sort(
                (a, b) => Number(b.is_default) - Number(a.is_default),
            )[0]?.src;
            lines.push({
                printifyProductId: item.productId,
                printifyVariantId: item.variantId,
                name: found.product.title,
                variantLabel: found.variant.title,
                quantity,
                unitPriceCents,
                image: defaultImg,
            });
        }
        return { lines, subtotalCents };
    }

    async calculateShippingCost(
        lineItems: { product_id: string; variant_id: number; quantity: number }[],
        addressTo: PrintifyAddressTo,
    ): Promise<number> {
        try {
            const res = await this.api<any>(
                `/shops/${this.shopId()}/orders/shipping.json`,
                {
                    method: 'POST',
                    body: {
                        line_items: lineItems,
                        address_to: addressTo,
                    },
                },
            );
            console.log('[Printify Shipping API Response]:', JSON.stringify(res));

            // Printify can return an object { standard: 450 } or a list of options
            if (typeof res?.standard === 'number') {
                return res.standard;
            }
            if (Array.isArray(res) && res.length > 0) {
                const std = res.find((s: any) => s.type === 'standard' || s.id === 'standard') || res[0];
                if (typeof std?.cost === 'number') return std.cost;
                if (typeof std?.price === 'number') return std.price;
            }
            return 0;
        } catch (err: any) {
            console.error('[Printify Shipping API Error]:', err?.message || err);
            return 0;
        }
    }

    async createOrder(input: {
        external_id: string;
        label?: string;
        line_items: { product_id: string; variant_id: number; quantity: number }[];
        address_to: PrintifyAddressTo;
    }): Promise<{ id: string }> {
        return this.api<{ id: string }>(`/shops/${this.shopId()}/orders.json`, {
            method: 'POST',
            body: {
                external_id: input.external_id,
                label: input.label,
                line_items: input.line_items,
                shipping_method: Number(process.env.PRINTIFY_SHIPPING_METHOD || 1),
                send_shipping_notification: false,
                address_to: input.address_to,
            },
        });
    }

    async sendToProduction(orderId: string): Promise<unknown> {
        return this.api(`/shops/${this.shopId()}/orders/${orderId}/send_to_production.json`, {
            method: 'POST',
        });
    }

    async fetchOrder(orderId: string): Promise<any> {
        return this.api(`/shops/${this.shopId()}/orders/${orderId}.json`);
    }
}
