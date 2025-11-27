import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/modules/users/models/User.model';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tanvishcouture.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@tanvishcouture.com');
      console.log('Password: Admin123!');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tanvishcouture.com',
      passwordHash,
      role: 'admin',
      addresses: [],
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@tanvishcouture.com');
    console.log('🔑 Password: Admin123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You can now login with these credentials.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminUser();

