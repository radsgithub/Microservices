import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order } from '../src/modules/orders/models/Order.model';

dotenv.config();

const updateOrderStatus = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get order ID from command line arguments
    const orderId = process.argv[2];
    const paymentStatus = process.argv[3] || 'paid';
    const orderStatus = process.argv[4] || 'processing';

    if (!orderId) {
      console.log('Usage: npm run update-order <orderId> [paymentStatus] [orderStatus]');
      console.log('Example: npm run update-order 6928676bb3605fd042958e8e paid processing');
      console.log('\nAvailable statuses:');
      console.log('Payment: pending, paid, failed, refunded');
      console.log('Order: pending, processing, shipped, delivered, cancelled');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Find and update order
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log(`❌ Order ${orderId} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Update order status
    order.paymentStatus = paymentStatus as any;
    order.orderStatus = orderStatus as any;
    await order.save();

    console.log(`\n✅ Order updated successfully!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Order ID: ${order._id}`);
    console.log(`Payment Status: ${order.paymentStatus}`);
    console.log(`Order Status: ${order.orderStatus}`);
    console.log(`Total Amount: £${order.totalAmount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating order:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateOrderStatus();

