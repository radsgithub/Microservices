import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order } from '../src/modules/orders/models/Order.model';
import { Address } from '../src/modules/address/models/Address.model';
import { ShippingService } from '../src/modules/shipping/services/shipping.service';

dotenv.config();

const bookShipment = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get order ID from command line
    const orderId = process.argv[2];

    if (!orderId) {
      console.log('Usage: npm run book-shipment <orderId>');
      console.log('Example: npm run book-shipment 6928676bb3605fd042958e8e');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Find order with user and address
    const order = await Order.findById(orderId)
      .populate('shippingAddressId')
      .populate('userId');
    
    if (!order) {
      console.log(`❌ Order ${orderId} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (order.paymentStatus !== 'paid') {
      console.log(`❌ Order payment status is ${order.paymentStatus}. Payment must be 'paid' before booking shipment.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const address = order.shippingAddressId as any;
    const user = order.userId as any;
    
    if (!address) {
      console.log('❌ Shipping address not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Calculate parcel dimensions (default values - can be improved)
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const weight = Math.max(0.1, totalItems * 0.5); // 0.5kg per item

    const shippingService = new ShippingService();
    
    const result = await shippingService.bookShipment(
      order.userId.toString(),
      orderId,
      {
        courier: 'EVRI',
        recipient: {
          name: user?.name || 'Customer',
          country: address.country || 'UAE',
          city: address.city || '',
          address: address.line1 || '',
          postalCode: address.postalCode || '',
        },
        parcel: {
          weight,
          length: 30,
          width: 20,
          height: 10,
        },
      }
    );

    console.log(`\n✅ Shipment booked successfully!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Order ID: ${order._id}`);
    console.log(`Tracking Number: ${result.trackingNumber}`);
    console.log(`Service: ${result.serviceName}`);
    console.log(`Label URL: ${result.labelUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nOrder status updated. Customer can now track their shipment.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error booking shipment:', error.message || error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

bookShipment();

