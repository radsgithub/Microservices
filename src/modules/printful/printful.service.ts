import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

const PRINTFUL_BASE_URL = 'https://api.printful.com';

function requireEnv(key: string): string {
    const val = process.env[key];
    if (!val) throw new InternalServerErrorException(`Missing ${key}`);
    return val;
}

export interface PrintfulAddressTo {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    country: string;
    region: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
}

export interface PrintfulOrderPayload {
    external_id: string;
    recipient: {
        name: string;
        company?: string;
        email: string;
        phone?: string;
        address1: string;
        address2?: string;
        city: string;
        state_code: string;
        country_code: string;
        zipcode: string;
    };
    items: {
        sync_variant_id: number;
        quantity: number;
    }[];
}

interface PrintfulApiResponse<T> {
    code: number;
    result: T;
    error?: {
        reason: string;
        message: string;
    };
}

export interface CheckoutItemInput {
    productId: string;
    variantId: number;
    quantity: number;
}

export interface PricedLine {
    printfulProductId: string; // the clean id, e.g. "12345"
    printfulVariantId: number;
    quantity: number;
    unitPriceCents: number;
    name: string;
    variantLabel: string;
    image: string;
}

export interface PricedOrder {
    lines: PricedLine[];
    subtotalCents: number;
}

@Injectable()
export class PrintfulService {
    private token() { return requireEnv('PRINTFUL_API_KEY'); }

    private async api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
        const res = await fetch(`${PRINTFUL_BASE_URL}${path}`, {
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
                `Printful ${res.status} on ${path}: ${text.slice(0, 300)}`,
            );
        }
        const json = await res.json() as PrintfulApiResponse<T>;
        if (json.code !== 200) {
            throw new InternalServerErrorException(
                `Printful API response code ${json.code}: ${json.error?.message || 'Unknown error'}`
            );
        }
        return json.result;
    }

    async priceOrder(items: CheckoutItemInput[]): Promise<PricedOrder> {
        if (!items || items.length === 0) {
            throw new BadRequestException('Printful Cart is empty.');
        }

        const lines: PricedLine[] = [];
        let subtotalCents = 0;

        const productIds = Array.from(new Set(items.map(i => i.productId)));
        const productMap = new Map<string, any>();

        for (const pid of productIds) {
            const cleanId = pid.replace(/^printful-/, '');
            const detail = await this.api<any>(`/store/products/${cleanId}`);
            productMap.set(cleanId, detail);
        }

        for (const item of items) {
            const cleanId = item.productId.replace(/^printful-/, '');
            const detail = productMap.get(cleanId);
            if (!detail) throw new BadRequestException(`Printful product not found: ${item.productId}`);

            const syncVariant = detail.sync_variants.find((v: any) => v.id === item.variantId);
            if (!syncVariant) {
                throw new BadRequestException(`Printful variant not found: ${item.variantId}`);
            }

            const priceNum = parseFloat(syncVariant.retail_price || '0');
            const unitPriceCents = Math.round(priceNum * 100);

            if (isNaN(unitPriceCents) || unitPriceCents <= 0) {
                throw new BadRequestException(`Invalid price for variant ${item.variantId}`);
            }

            lines.push({
                printfulProductId: cleanId,
                printfulVariantId: syncVariant.id,
                quantity: item.quantity,
                unitPriceCents,
                name: detail.sync_product.name,
                variantLabel: syncVariant.name,
                image: syncVariant.product?.image || detail.sync_product.thumbnail_url,
            });
            subtotalCents += unitPriceCents * item.quantity;
        }

        return { lines, subtotalCents };
    }

    async calculateShippingCost(
        items: { product_id: string; variant_id: number; quantity: number }[],
        addressTo: PrintfulAddressTo,
    ): Promise<number> {
        if (!items || items.length === 0) return 0;

        try {
            const payload = {
                recipient: {
                    address1: addressTo.address1,
                    city: addressTo.city,
                    state_code: addressTo.region,
                    country_code: addressTo.country,
                    zipcode: addressTo.zip,
                },
                items: items.map(i => ({
                    sync_variant_id: i.variant_id,
                    quantity: i.quantity,
                })),
            };

            const res = await this.api<any>('/orders/estimate-costs', {
                method: 'POST',
                body: payload,
            });

            const shippingStr = res.costs?.shipping || '0';
            const shippingCents = Math.round(parseFloat(shippingStr) * 100);

            return shippingCents;
        } catch (err: any) {
            console.error('[Printful Shipping API Error]:', err?.message || err);
            return 500;
        }
    }

    async createOrder(payload: PrintfulOrderPayload): Promise<any> {
        return this.api<any>('/orders', {
            method: 'POST',
            body: payload,
        });
    }

    async sendToProduction(orderId: string): Promise<any> {
        return this.api<any>(`/orders/${orderId}/confirm`, {
            method: 'POST',
        });
    }
}
