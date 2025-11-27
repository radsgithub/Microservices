import gocardlessClient from '../../../config/gocardless';
import { OrderService } from '../../orders/services/order.service';
import { Order } from '../../orders/models/Order.model';
import { User } from '../../users/models/User.model';
import { Address } from '../../address/models/Address.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

const orderService = new OrderService();

export interface CreateMandateData {
  userEmail: string;
  userName: string;
  userAddressId: string;
  redirectUri: string;
}

export interface CreateOrderPaymentData {
  orderId: string;
  mandateId: string;
}

export class PaymentService {
  async createMandate(userId: string, data: CreateMandateData) {
    const { userEmail, userName, userAddressId, redirectUri } = data;

    // Verify user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found');
    }

    // Get address
    const address = await Address.findOne({
      _id: userAddressId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!address) {
      throw new AppError('Address not found');
    }

    try {
      // Create customer in GoCardless
      const customer = await gocardlessClient.customers.create({
        email: userEmail,
        given_name: userName.split(' ')[0] || userName,
        family_name: userName.split(' ').slice(1).join(' ') || '',
        address_line1: address.line1,
        address_line2: address.line2,
        city: address.city,
        region: address.state,
        postal_code: address.postalCode,
        country_code: address.country,
      });

      // Create customer bank account (this would typically be done via redirect flow)
      // For now, we'll create a redirect flow for mandate setup
      const redirectFlow = await gocardlessClient.redirectFlows.create({
        description: `Payment mandate for ${userName}`,
        session_token: `session_${userId}_${Date.now()}`,
        success_redirect_url: redirectUri,
        prefilled_customer: {
          email: userEmail,
          given_name: userName.split(' ')[0] || userName,
          family_name: userName.split(' ').slice(1).join(' ') || '',
          address_line1: address.line1,
          address_line2: address.line2,
          city: address.city,
          region: address.state,
          postal_code: address.postalCode,
          country_code: address.country,
        },
      });

      return {
        redirectUrl: redirectFlow.redirect_url,
        redirectFlowId: redirectFlow.id,
        customerId: customer.id,
      };
    } catch (error: any) {
      throw new AppError(`GoCardless error: ${error.message || 'Failed to create mandate'}`);
    }
  }

  async createOrderPayment(userId: string, data: CreateOrderPaymentData) {
    const { orderId, mandateId } = data;

    // Verify order belongs to user
    const order = await orderService.getOrder(userId, orderId);

    if (order.paymentStatus !== 'pending') {
      throw new AppError('Order payment already processed');
    }

    try {
      // Create payment in GoCardless
      const payment = await gocardlessClient.payments.create({
        amount: Math.round(order.totalAmount * 100), // Convert to pence/cents
        currency: 'GBP',
        links: {
          mandate: mandateId,
        },
        metadata: {
          order_id: orderId,
          user_id: userId,
        },
      });

      // Update order with payment info
      const updatedOrder = await orderService.updateOrderStatus(orderId, {
        gocardlessPaymentId: payment.id,
        paymentStatus: payment.status === 'confirmed' ? 'paid' : 'pending',
      });

      return {
        paymentId: payment.id,
        paymentStatus: payment.status,
        order: updatedOrder,
      };
    } catch (error: any) {
      throw new AppError(`GoCardless payment error: ${error.message || 'Failed to create payment'}`);
    }
  }

  async handleWebhook(webhookData: any) {
    try {
      // GoCardless webhook structure
      const { events } = webhookData;

      for (const event of events) {
        if (event.resource_type === 'payments') {
          const paymentId = event.links?.payment || event.id;
          const paymentStatus = event.action; // 'confirmed', 'failed', etc.

          // Find order by gocardlessPaymentId
          const order = await Order.findOne({ gocardlessPaymentId: paymentId });

          if (order) {
            // Update order payment status
            const updatedOrder = await orderService.updateOrderStatus(order._id.toString(), {
              paymentStatus:
                paymentStatus === 'confirmed'
                  ? 'paid'
                  : paymentStatus === 'failed'
                  ? 'failed'
                  : 'pending',
            });

            // If payment confirmed, update order status to processing
            if (paymentStatus === 'confirmed' && updatedOrder) {
              await orderService.updateOrderStatus(updatedOrder._id.toString(), {
                orderStatus: 'processing',
              });
            }
          }
        }
      }

      return { received: true };
    } catch (error: any) {
      throw new AppError(`Webhook processing error: ${error.message}`);
    }
  }
}

