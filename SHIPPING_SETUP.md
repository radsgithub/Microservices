# Evri Shipping Integration via Parcel2Go API

## Overview

This e-commerce platform uses **Evri** shipping through the **Parcel2Go API** for international deliveries. This is the recommended approach for small to medium e-commerce stores.

## Setup Instructions

### 1. Get Parcel2Go API Credentials

1. Sign up at [Parcel2Go](https://www.parcel2go.com/api)
2. Get your API key from the dashboard
3. Add to `.env` file:

```env
PARCEL2GO_API_URL=https://api.parcel2go.com/v1
PARCEL2GO_API_KEY=your-api-key-here
```

### 2. Current Implementation

The system currently uses **mock data** for development/testing. To use real Parcel2Go API:

1. Update `.env` with your API credentials
2. The service will automatically switch from mock to real API calls

## API Endpoints

### Get Shipping Rate
**POST** `/api/shipping/get-rate`

Request:
```json
{
  "courier": "EVRI",
  "from": "UK",
  "to": "UAE",
  "weight": 1.2,
  "length": 30,
  "width": 20,
  "height": 10
}
```

Response:
```json
{
  "serviceName": "Evri International Standard",
  "price": 7.20,
  "deliveryTime": "7-12 days",
  "courier": "EVRI"
}
```

### Book Shipment
**POST** `/api/shipping/book` (Requires authentication)

Request:
```json
{
  "orderId": "order_id_here",
  "courier": "EVRI",
  "recipient": {
    "name": "Customer Name",
    "country": "UAE",
    "city": "Dubai",
    "address": "Address Line 1",
    "postalCode": "00000"
  },
  "parcel": {
    "weight": 1.2,
    "length": 30,
    "width": 20,
    "height": 10
  }
}
```

Response:
```json
{
  "trackingNumber": "EVRI123456789",
  "labelUrl": "https://parcel2go.com/labels/xxxx.pdf",
  "serviceName": "Evri International Standard"
}
```

### Track Shipment
**GET** `/api/shipping/track/:trackingNumber`

Response:
```json
{
  "status": "In Transit",
  "courier": "Evri International",
  "trackingNumber": "EVRI123456789",
  "lastUpdate": "2025-11-27T20:00:00Z",
  "events": [
    {
      "date": "2025-11-27T20:00:00Z",
      "status": "In Transit",
      "location": "London, UK"
    }
  ]
}
```

## Order Flow with Shipping

### Step 1: Customer Places Order
- Customer adds items to cart
- Goes to checkout
- Selects shipping address
- System fetches shipping rate from Parcel2Go
- Customer sees shipping cost and delivery time
- Customer places order

### Step 2: Payment Processing
- Customer pays via GoCardless
- Order status: `paymentStatus: 'paid'`

### Step 3: Book Shipment (Admin Action)
After payment is confirmed, admin needs to book the shipment:

**Option A: Via API (Recommended)**
```bash
curl -X POST http://localhost:3002/api/shipping/book \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "courier": "EVRI",
    "recipient": {
      "name": "Customer Name",
      "country": "UAE",
      "city": "Dubai",
      "address": "Address Line",
      "postalCode": "00000"
    },
    "parcel": {
      "weight": 1.2,
      "length": 30,
      "width": 20,
      "height": 10
    }
  }'
```

**Option B: Create Admin UI** (Future enhancement)
- Add admin page to book shipments
- Automatically extract recipient info from order address
- Calculate parcel dimensions from products

### Step 4: Tracking
- Tracking number saved to order
- Customer can view tracking on order details page
- Real-time updates from Parcel2Go API

## Database Schema

### Order Model (Updated)
```typescript
{
  // ... existing fields
  trackingNumber?: string;
  shippingLabelUrl?: string;
  shippingCost?: number;
  shippingCourier?: string;
  shippingServiceName?: string;
}
```

### Shipping Model (New)
```typescript
{
  orderId: ObjectId;
  courier: string;
  serviceName: string;
  trackingNumber?: string;
  labelUrl?: string;
  shippingStatus: 'pending' | 'booked' | 'in_transit' | 'delivered' | 'failed';
  weight: number;
  dimensions: { length, width, height };
}
```

## Frontend Integration

### Checkout Page
- Automatically fetches shipping rate when address is selected
- Shows shipping cost and delivery time
- Includes shipping cost in order total

### Order Details Page
- Displays tracking number (if available)
- Shows shipping courier and service
- Fetches and displays real-time tracking updates

## Testing Without API Key

The system works with mock data when `PARCEL2GO_API_KEY` is not set:
- Returns default shipping rate: £7.20
- Returns mock tracking number: `EVRI{timestamp}`
- Perfect for development and testing

## Next Steps

1. **Get Parcel2Go API Key** - Sign up and get credentials
2. **Update .env** - Add `PARCEL2GO_API_KEY`
3. **Test Integration** - Create test order and book shipment
4. **Create Admin UI** (Optional) - Build admin interface for booking shipments

## Manual Booking Script

For testing, you can create a script to book shipments:

```typescript
// scripts/book-shipment.ts
import mongoose from 'mongoose';
import { ShippingService } from '../src/modules/shipping/services/shipping.service';

const shippingService = new ShippingService();

// Book shipment for order
await shippingService.bookShipment(userId, orderId, {
  courier: 'EVRI',
  recipient: { /* address details */ },
  parcel: { /* dimensions */ }
});
```

