import { Shipping } from '../models/Shipping.model';
import { Order } from '../../orders/models/Order.model';
import { Address } from '../../address/models/Address.model';
import { AppError } from '../../../middleware/errorHandler';
import { config } from '../../../config/env';
import mongoose from 'mongoose';
import axios from 'axios';

// Parcel2Go API configuration
const PARCEL2GO_API_URL = config.parcel2goApiUrl;
const PARCEL2GO_API_KEY = config.parcel2goApiKey;

export interface GetRateRequest {
  courier: string;
  from: string;
  to: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface GetRateResponse {
  serviceName: string;
  price: number;
  deliveryTime: string;
  courier: string;
}

export interface BookShipmentRequest {
  courier: string;
  recipient: {
    name: string;
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  parcel: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
}

export interface BookShipmentResponse {
  trackingNumber: string;
  labelUrl: string;
  serviceName: string;
}

export class ShippingService {
  async getRate(data: GetRateRequest): Promise<GetRateResponse> {
    const { courier, from, to, weight, length, width, height } = data;

    try {
      // Call Parcel2Go API to get shipping rate
      // Note: This is a placeholder - replace with actual Parcel2Go API call
      // You'll need to sign up at https://www.parcel2go.com/api and get API credentials
      
      if (!PARCEL2GO_API_KEY) {
        // Return mock data for development
        console.warn('Parcel2Go API key not configured - using mock data');
        return {
          serviceName: 'Evri International Standard',
          price: 7.20,
          deliveryTime: '7-12 days',
          courier: 'EVRI',
        };
      }

      const response = await axios.post(
        `${PARCEL2GO_API_URL}/rates`,
        {
          courier,
          from,
          to,
          weight,
          dimensions: {
            length,
            width,
            height,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${PARCEL2GO_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        serviceName: response.data.serviceName || 'Evri International Standard',
        price: response.data.price || 7.20,
        deliveryTime: response.data.deliveryTime || '7-12 days',
        courier: response.data.courier || 'EVRI',
      };
    } catch (error: any) {
      console.error('Parcel2Go API error:', error);
      // Return mock data if API fails
      return {
        serviceName: 'Evri International Standard',
        price: 7.20,
        deliveryTime: '7-12 days',
        courier: 'EVRI',
      };
    }
  }

  async bookShipment(userId: string, orderId: string, data: BookShipmentRequest): Promise<BookShipmentResponse> {
    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    }).populate('shippingAddressId');

    if (!order) {
      throw new AppError('Order not found');
    }

    if (order.paymentStatus !== 'paid') {
      throw new AppError('Order must be paid before booking shipment');
    }

    // Check if shipping already exists
    let shipping = await Shipping.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
    if (shipping && shipping.shippingStatus !== 'pending') {
      throw new AppError('Shipment already booked');
    }

    try {
      // Call Parcel2Go API to book shipment
      if (!PARCEL2GO_API_KEY) {
        // Return mock data for development
        console.warn('Parcel2Go API key not configured - using mock data');
        const mockTracking = `EVRI${Date.now()}`;
        const mockLabelUrl = 'https://parcel2go.com/labels/mock.pdf';
        
        if (!shipping) {
          shipping = await Shipping.create({
            orderId: new mongoose.Types.ObjectId(orderId),
            courier: data.courier,
            serviceName: 'Evri International Standard',
            trackingNumber: mockTracking,
            labelUrl: mockLabelUrl,
            shippingStatus: 'booked',
            weight: data.parcel.weight,
            dimensions: data.parcel,
          });
        } else {
          shipping.trackingNumber = mockTracking;
          shipping.labelUrl = mockLabelUrl;
          shipping.shippingStatus = 'booked';
          await shipping.save();
        }

        // Update order with tracking info
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            trackingNumber: mockTracking,
            shippingLabelUrl: mockLabelUrl,
          },
        });

        return {
          trackingNumber: mockTracking,
          labelUrl: mockLabelUrl,
          serviceName: 'Evri International Standard',
        };
      }

      const response = await axios.post(
        `${PARCEL2GO_API_URL}/book`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${PARCEL2GO_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const trackingNumber = response.data.trackingNumber;
      const labelUrl = response.data.labelUrl;
      const serviceName = response.data.serviceName || 'Evri International Standard';

      // Save shipping info
      if (!shipping) {
        shipping = await Shipping.create({
          orderId: new mongoose.Types.ObjectId(orderId),
          courier: data.courier,
          serviceName,
          trackingNumber,
          labelUrl,
          shippingStatus: 'booked',
          weight: data.parcel.weight,
          dimensions: data.parcel,
        });
      } else {
        shipping.trackingNumber = trackingNumber;
        shipping.labelUrl = labelUrl;
        shipping.shippingStatus = 'booked';
        await shipping.save();
      }

      // Update order with tracking info
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          trackingNumber,
          shippingLabelUrl: labelUrl,
        },
      });

      return {
        trackingNumber,
        labelUrl,
        serviceName,
      };
    } catch (error: any) {
      console.error('Parcel2Go booking error:', error);
      throw new AppError(`Failed to book shipment: ${error.message || 'Unknown error'}`);
    }
  }

  async trackShipment(trackingNumber: string) {
    try {
      if (!PARCEL2GO_API_KEY) {
        // Return mock data for development
        console.warn('Parcel2Go API key not configured - using mock data');
        return {
          status: 'In Transit',
          courier: 'Evri International',
          trackingNumber,
          lastUpdate: new Date().toISOString(),
          events: [
            {
              date: new Date().toISOString(),
              status: 'In Transit',
              location: 'London, UK',
            },
          ],
        };
      }

      const response = await axios.get(
        `${PARCEL2GO_API_URL}/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${PARCEL2GO_API_KEY}`,
          },
        }
      );

      return {
        status: response.data.status || 'In Transit',
        courier: response.data.courier || 'Evri International',
        trackingNumber,
        lastUpdate: response.data.lastUpdate || new Date().toISOString(),
        events: response.data.events || [],
      };
    } catch (error: any) {
      console.error('Parcel2Go tracking error:', error);
      throw new AppError(`Failed to track shipment: ${error.message || 'Unknown error'}`);
    }
  }

  async getShippingByOrderId(orderId: string) {
    return await Shipping.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
  }
}

