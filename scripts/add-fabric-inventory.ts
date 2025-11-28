import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FabricInventory } from '../src/modules/production/models/FabricInventory.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function addFabricInventory() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample fabric inventory
    const fabrics = [
      {
        fabricType: 'Cotton',
        color: 'Black',
        source: 'recycled' as const,
        quantity: 50,
        cost: 8.5,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Cotton',
        color: 'Navy',
        source: 'recycled' as const,
        quantity: 40,
        cost: 8.5,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Cotton',
        color: 'White',
        source: 'recycled' as const,
        quantity: 35,
        cost: 8.5,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Cotton',
        color: 'Beige',
        source: 'recycled' as const,
        quantity: 30,
        cost: 8.5,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Cotton',
        color: 'Red',
        source: 'recycled' as const,
        quantity: 25,
        cost: 9.0,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Cotton',
        color: 'Pink',
        source: 'recycled' as const,
        quantity: 20,
        cost: 9.0,
        sustainabilityScore: 90,
      },
      {
        fabricType: 'Polyester',
        color: 'Black',
        source: 'recycled' as const,
        quantity: 45,
        cost: 6.5,
        sustainabilityScore: 85,
      },
      {
        fabricType: 'Polyester',
        color: 'Navy',
        source: 'recycled' as const,
        quantity: 35,
        cost: 6.5,
        sustainabilityScore: 85,
      },
    ];

    for (const fabric of fabrics) {
      const existing = await FabricInventory.findOne({
        fabricType: fabric.fabricType,
        color: fabric.color,
      });

      if (existing) {
        existing.quantity += fabric.quantity;
        existing.cost = fabric.cost;
        existing.source = fabric.source;
        existing.sustainabilityScore = fabric.sustainabilityScore;
        await existing.save();
        console.log(`Updated: ${fabric.fabricType} ${fabric.color}`);
      } else {
        await FabricInventory.create(fabric);
        console.log(`Created: ${fabric.fabricType} ${fabric.color}`);
      }
    }

    console.log('\n✅ Fabric inventory added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addFabricInventory();

