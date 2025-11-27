import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/modules/products/models/Product.model';

dotenv.config();

const sampleProducts = [
  {
    name: 'Elegant Silk Blouse',
    description: 'A sophisticated silk blouse perfect for both office and evening wear. Made from premium quality silk with a classic fit.',
    price: 89.99,
    category: 'clothing',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy', 'Burgundy'],
    stock: 50,
    fabricInfo: '100% Pure Silk',
    isRecycledFabric: false,
  },
  {
    name: 'Classic Tailored Blazer',
    description: 'A timeless tailored blazer that exudes sophistication. Perfect for professional settings and formal occasions.',
    price: 149.99,
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Charcoal'],
    stock: 35,
    fabricInfo: 'Wool Blend',
    isRecycledFabric: false,
  },
  {
    name: 'Designer Leather Handbag',
    description: 'A luxurious leather handbag with elegant design and spacious interior. Perfect for everyday use.',
    price: 199.99,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'
    ],
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    stock: 25,
    fabricInfo: 'Genuine Leather',
    isRecycledFabric: false,
  },
  {
    name: 'Eco-Friendly Cotton Dress',
    description: 'A beautiful sustainable dress made from organic cotton. Comfortable, stylish, and environmentally conscious.',
    price: 79.99,
    category: 'clothing',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'Sage Green', 'Dusty Rose'],
    stock: 40,
    fabricInfo: '100% Organic Cotton',
    isRecycledFabric: true,
  },
  {
    name: 'Luxury Cashmere Scarf',
    description: 'An ultra-soft cashmere scarf that adds elegance to any outfit. Perfect for all seasons.',
    price: 129.99,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'
    ],
    sizes: ['One Size'],
    colors: ['Cream', 'Grey', 'Burgundy', 'Navy'],
    stock: 30,
    fabricInfo: '100% Cashmere',
    isRecycledFabric: false,
  },
  {
    name: 'Structured Midi Skirt',
    description: 'A beautifully structured midi skirt that flatters all body types. Perfect for both casual and formal occasions.',
    price: 69.99,
    category: 'clothing',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Grey'],
    stock: 45,
    fabricInfo: 'Polyester Blend',
    isRecycledFabric: false,
  },
  {
    name: 'Minimalist Gold Watch',
    description: 'A sophisticated minimalist watch with a sleek gold design. Perfect for adding elegance to any outfit.',
    price: 249.99,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800'
    ],
    sizes: ['One Size'],
    colors: ['Gold', 'Rose Gold', 'Silver'],
    stock: 20,
    fabricInfo: 'Stainless Steel',
    isRecycledFabric: false,
  },
  {
    name: 'Premium Wool Coat',
    description: 'A luxurious wool coat that combines warmth with style. Perfect for winter elegance.',
    price: 299.99,
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Black', 'Navy'],
    stock: 28,
    fabricInfo: '100% Wool',
    isRecycledFabric: false,
  },
  {
    name: 'Silk Evening Gown',
    description: 'An exquisite silk evening gown perfect for special occasions. Elegant and timeless design.',
    price: 399.99,
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Navy', 'Burgundy'],
    stock: 15,
    fabricInfo: '100% Pure Silk',
    isRecycledFabric: false,
  },
  {
    name: 'Designer Sunglasses',
    description: 'Stylish designer sunglasses with UV protection. Perfect for sunny days and adding a touch of glamour.',
    price: 89.99,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'
    ],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Tortoise'],
    stock: 50,
    fabricInfo: 'Acetate Frame',
    isRecycledFabric: false,
  },
  {
    name: 'Classic White Shirt',
    description: 'A timeless white shirt that never goes out of style. Versatile and perfect for any wardrobe.',
    price: 59.99,
    category: 'clothing',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Ivory'],
    stock: 60,
    fabricInfo: '100% Cotton',
    isRecycledFabric: false,
  },
  {
    name: 'Luxury Perfume Set',
    description: 'An elegant perfume set with three signature scents. Perfect for gifting or personal collection.',
    price: 179.99,
    category: 'beauty',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
      'https://images.unsplash.com/photo-1595425970377-c970029bf94e?w=800'
    ],
    sizes: ['One Size'],
    colors: ['Set of 3'],
    stock: 25,
    fabricInfo: 'Premium Fragrance',
    isRecycledFabric: false,
  },
];

const addProducts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`Found ${existingProducts} existing products.`);
      console.log('Do you want to add more products? (This will add new products, not replace existing ones)');
    }

    // Add products
    const createdProducts = await Product.insertMany(sampleProducts);

    console.log(`\n✅ Successfully added ${createdProducts.length} products!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Products added:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - £${product.price}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding products:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

addProducts();

