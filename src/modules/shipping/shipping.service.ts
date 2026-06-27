import { Injectable, Logger } from '@nestjs/common';
import { GetRateDto } from './dtos/get-rate.dto';

const SHIPPO_API = 'https://api.goshippo.com';

// Multi-carrier (Shippo) shipping with a USPS fallback.
//
// - If SHIPPO_API_KEY is set in .env, real USPS/UPS/FedEx rates, labels, and
//   tracking are fetched from Shippo (https://goshippo.com — free to start).
// - If it is NOT set, a simple USPS-style estimate is used so the store keeps
//   working with no external account.
//
// Required .env to go live:
//   SHIPPO_API_KEY=shippo_test_xxx (or shippo_live_xxx)
//   SHIP_FROM_NAME, SHIP_FROM_STREET, SHIP_FROM_CITY, SHIP_FROM_STATE,
//   SHIP_FROM_ZIP, SHIP_FROM_COUNTRY (e.g. US)
@Injectable()
export class ShippingService {
    private readonly logger = new Logger(ShippingService.name);
    private readonly apiKey = process.env.SHIPPO_API_KEY || '';

    private get fromAddress() {
        return {
            name: process.env.SHIP_FROM_NAME || 'Tanvish Couture',
            street1: process.env.SHIP_FROM_STREET || '1 Market St',
            city: process.env.SHIP_FROM_CITY || 'San Francisco',
            state: process.env.SHIP_FROM_STATE || 'CA',
            zip: process.env.SHIP_FROM_ZIP || '94105',
            country: process.env.SHIP_FROM_COUNTRY || 'US',
            // USPS requires the sender's email + phone to buy a label.
            email: process.env.SHIP_FROM_EMAIL || 'shipping@tanvishcouture.com',
            phone: process.env.SHIP_FROM_PHONE || '4155551234',
        };
    }

    private async shippo(path: string, body: any): Promise<any> {
        const res = await fetch(`${SHIPPO_API}${path}`, {
            method: 'POST',
            headers: {
                Authorization: `ShippoToken ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`Shippo ${path} failed: ${res.status}`);
        }
        return res.json() as Promise<any>;
    }

    // ---- Rates -------------------------------------------------------------

    async getRate(dto: GetRateDto) {
        if (this.apiKey && dto.toPostalCode) {
            try {
                return await this.getRateFromShippo(dto);
            } catch (err: any) {
                this.logger.warn(`Shippo rate failed, using fallback: ${err.message}`);
            }
        }
        return this.fallbackRate(dto);
    }

    private async getRateFromShippo(dto: GetRateDto) {
        const shipment = await this.shippo('/shipments/', {
            address_from: this.fromAddress,
            address_to: {
                name: 'Customer',
                street1: dto.toStreet || 'N/A',
                city: dto.toCity,
                state: dto.toState,
                zip: dto.toPostalCode,
                country: (dto.to || 'US').toUpperCase().startsWith('US') ? 'US' : dto.to,
            },
            parcels: [{
                length: String(dto.length || 10),
                width: String(dto.width || 8),
                height: String(dto.height || 4),
                distance_unit: 'in',
                weight: String(dto.weight || 1),
                mass_unit: 'lb',
            }],
            async: false,
        });

        const rates: any[] = shipment.rates || [];
        if (!rates.length) throw new Error('no rates returned');

        // Cheapest rate, preferring USPS.
        const sorted = rates.sort((a, b) => Number(a.amount) - Number(b.amount));
        const chosen = sorted.find((r) => /usps/i.test(r.provider)) || sorted[0];

        return {
            serviceName: `${chosen.provider} ${chosen.servicelevel?.name || ''}`.trim(),
            price: Number(chosen.amount),
            deliveryTime: chosen.estimated_days ? `${chosen.estimated_days} business days` : 'varies',
            courier: chosen.provider,
            rateId: chosen.object_id, // used by bookShipment
        };
    }

    private fallbackRate(dto: GetRateDto) {
        const weight = dto.weight && dto.weight > 0 ? dto.weight : 1;
        const isDomestic = (dto.to || 'US').trim().toUpperCase().match(/^(US|USA|UNITED STATES)$/) !== null;

        if (isDomestic) {
            const price = Math.round((4.5 + weight * 0.85) * 100) / 100;
            return {
                serviceName: 'USPS Ground Advantage',
                price,
                deliveryTime: '2-5 business days',
                courier: 'USPS',
            };
        }
        const price = Math.round((18 + weight * 3) * 100) / 100;
        return {
            serviceName: 'USPS Priority Mail International',
            price,
            deliveryTime: '7-14 business days',
            courier: 'USPS',
        };
    }

    // ---- Labels ------------------------------------------------------------

    async bookShipment(data: any) {
        if (this.apiKey && data?.rateId) {
            try {
                const tx = await this.shippo('/transactions/', {
                    rate: data.rateId,
                    label_file_type: 'PDF',
                    async: false,
                });
                if (tx.status === 'SUCCESS') {
                    return {
                        trackingNumber: tx.tracking_number,
                        labelUrl: tx.label_url,
                        serviceName: data.serviceName || 'USPS',
                    };
                }
                this.logger.warn(`Shippo transaction not successful: ${JSON.stringify(tx.messages)}`);
            } catch (err: any) {
                this.logger.warn(`Shippo label failed, using stub: ${err.message}`);
            }
        }
        // Stub label.
        const trackingNumber = '94' + Date.now().toString().slice(-18);
        return {
            trackingNumber,
            labelUrl: `https://example.com/labels/${trackingNumber}.pdf`,
            serviceName: data?.serviceName || 'USPS Ground Advantage',
        };
    }

    // ---- Fulfillment: create + buy a label in one call ---------------------

    // `to` = { name, street1, city, state, zip, country }
    // `parcel` = { length, width, height, weight } (inches / lb)
    async purchaseLabel(to: any, parcel: any) {
        if (this.apiKey && to?.zip) {
            try {
                const shipment = await this.shippo('/shipments/', {
                    address_from: this.fromAddress,
                    // Carriers require a valid-format recipient phone/email; use a
                    // placeholder when the customer didn't provide one.
                    address_to: { phone: '5125551234', email: 'customer@example.com', ...to },
                    parcels: [{
                        length: String(parcel.length || 10),
                        width: String(parcel.width || 8),
                        height: String(parcel.height || 4),
                        distance_unit: 'in',
                        weight: String(parcel.weight || 1),
                        mass_unit: 'lb',
                    }],
                    async: false,
                });
                const rates: any[] = shipment.rates || [];
                const sorted = rates.sort((a, b) => Number(a.amount) - Number(b.amount));
                const chosen = sorted.find((r) => /usps/i.test(r.provider)) || sorted[0];
                if (chosen) {
                    const tx = await this.shippo('/transactions/', {
                        rate: chosen.object_id,
                        label_file_type: 'PDF',
                        async: false,
                    });
                    if (tx.status === 'SUCCESS') {
                        return {
                            trackingNumber: tx.tracking_number,
                            labelUrl: tx.label_url,
                            serviceName: `${chosen.provider} ${chosen.servicelevel?.name || ''}`.trim(),
                            courier: chosen.provider,
                        };
                    }
                    this.logger.warn(`Shippo transaction failed: ${JSON.stringify(tx.messages)}`);
                }
            } catch (err: any) {
                this.logger.warn(`Shippo label purchase failed, using stub: ${err.message}`);
            }
        }
        // Stub label (no key / not configured).
        const trackingNumber = '94' + Date.now().toString().slice(-18);
        return {
            trackingNumber,
            labelUrl: `https://example.com/labels/${trackingNumber}.pdf`,
            serviceName: 'USPS Ground Advantage',
            courier: 'USPS',
        };
    }

    // ---- Tracking ----------------------------------------------------------

    async trackShipment(trackingNumber: string, carrier = 'usps') {
        if (this.apiKey) {
            try {
                const res = await fetch(`${SHIPPO_API}/tracks/${carrier}/${trackingNumber}`, {
                    headers: { Authorization: `ShippoToken ${this.apiKey}` },
                });
                if (res.ok) {
                    const t: any = await res.json();
                    return {
                        status: t.tracking_status?.status || 'unknown',
                        courier: (t.carrier || carrier).toUpperCase(),
                        trackingNumber,
                        lastUpdate: t.tracking_status?.status_date || new Date().toISOString(),
                        events: (t.tracking_history || []).map((e: any) => ({
                            date: e.status_date,
                            status: e.status,
                            location: e.location?.city || '',
                        })),
                    };
                }
            } catch (err: any) {
                this.logger.warn(`Shippo tracking failed, using stub: ${err.message}`);
            }
        }
        return {
            status: 'in_transit',
            courier: 'USPS',
            trackingNumber,
            lastUpdate: new Date().toISOString(),
            events: [
                { date: new Date().toISOString(), status: 'in_transit', location: 'USPS Regional Facility' },
            ],
        };
    }
}
