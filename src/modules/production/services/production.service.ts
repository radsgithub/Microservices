import { Order } from '../../orders/models/Order.model';
import { Product } from '../../products/models/Product.model';
import { ProductionBatch, IProductionBatch } from '../models/ProductionBatch.model';
import { FabricInventory } from '../models/FabricInventory.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface ProductionOptimizationResult {
  batches: IProductionBatch[];
  totalFabricNeeded: number;
  totalWaste: number;
  averageEfficiency: number;
  fabricShortage?: {
    fabricType: string;
    color: string;
    needed: number;
    available: number;
  }[];
}

// Fabric requirements per size (in meters)
const FABRIC_PER_SIZE: Record<string, number> = {
  S: 1.2,
  M: 1.5,
  L: 1.6,
  XL: 1.8,
  XXL: 2.0,
};

// Batch efficiency based on batch size
function getBatchEfficiency(batchSize: number): number {
  if (batchSize === 1) return 0.85; // 15% waste
  if (batchSize === 2) return 0.90; // 10% waste
  if (batchSize >= 3 && batchSize <= 5) return 0.93; // 7% waste
  if (batchSize >= 6 && batchSize <= 10) return 0.95; // 5% waste
  return 0.96; // 4% waste for very large batches
}

export class ProductionService {
  async optimizeProduction(orderIds?: string[]): Promise<ProductionOptimizationResult> {
    // Get pending orders
    const query: any = {
      orderStatus: 'pending',
      paymentStatus: 'paid',
    };

    if (orderIds && orderIds.length > 0) {
      query._id = { $in: orderIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    const orders = await Order.find(query).populate('items.productId');

    if (orders.length === 0) {
      throw new AppError('No pending orders found');
    }

    // Group orders by product, size, and color
    const orderGroups = new Map<string, any[]>();

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.productId as any;
        if (!product) continue;

        const key = `${product._id}-${item.size}-${item.color}`;
        if (!orderGroups.has(key)) {
          orderGroups.set(key, []);
        }
        orderGroups.get(key)!.push({
          orderId: order._id,
          productId: product._id,
          product: product,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        });
      }
    }

    // Create batches
    const batches: IProductionBatch[] = [];
    const fabricShortage: ProductionOptimizationResult['fabricShortage'] = [];
    let totalFabricNeeded = 0;
    let totalWaste = 0;

    for (const [key, groupItems] of orderGroups.entries()) {
      const [productId, size, color] = key.split('-');
      const product = groupItems[0].product;

      // Calculate total quantity in this group
      const totalQuantity = groupItems.reduce((sum, item) => sum + item.quantity, 0);
      const batchSize = groupItems.length;

      // Get fabric requirements
      const fabricPerUnit = FABRIC_PER_SIZE[size] || 1.5;
      const efficiency = getBatchEfficiency(batchSize);
      const totalFabricNeededForBatch = (fabricPerUnit * totalQuantity) / efficiency;
      const wasteForBatch = totalFabricNeededForBatch - (fabricPerUnit * totalQuantity);

      // Check fabric availability
      // Use product fabric info or default to Cotton
      const fabricType = (product.fabricInfo && product.fabricInfo.trim()) || 
                        (product.isRecycledFabric ? 'Recycled Cotton' : 'Cotton');
      const fabric = await FabricInventory.findOne({
        fabricType: fabricType,
        color: color,
      });

      if (!fabric || fabric.quantity < totalFabricNeededForBatch) {
        fabricShortage.push({
          fabricType,
          color,
          needed: totalFabricNeededForBatch,
          available: fabric?.quantity || 0,
        });
        continue;
      }

      // Create batch
      const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const batchItems = groupItems.map((item) => ({
        orderId: item.orderId,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const batch = await ProductionBatch.create({
        batchId,
        items: batchItems,
        fabricType,
        fabricColor: color,
        fabricUsed: totalFabricNeededForBatch,
        wasteGenerated: wasteForBatch,
        efficiency: efficiency * 100,
        status: 'pending',
      });

      batches.push(batch);
      totalFabricNeeded += totalFabricNeededForBatch;
      totalWaste += wasteForBatch;
    }

    const averageEfficiency =
      batches.length > 0
        ? batches.reduce((sum, b) => sum + b.efficiency, 0) / batches.length
        : 0;

    return {
      batches,
      totalFabricNeeded,
      totalWaste,
      averageEfficiency,
      fabricShortage: fabricShortage.length > 0 ? fabricShortage : undefined,
    };
  }

  async getPendingBatches() {
    return await ProductionBatch.find({
      status: { $in: ['pending', 'in-production'] },
    })
      .populate('items.orderId')
      .populate('items.productId')
      .sort({ createdAt: -1 });
  }

  async getAllBatches() {
    return await ProductionBatch.find()
      .populate('items.orderId')
      .populate('items.productId')
      .sort({ createdAt: -1 });
  }

  async startBatch(batchId: string) {
    const batch = await ProductionBatch.findOne({ batchId });
    if (!batch) {
      throw new AppError('Batch not found');
    }

    if (batch.status !== 'pending') {
      throw new AppError('Batch is not in pending status');
    }

    // Check fabric availability
    const fabric = await FabricInventory.findOne({
      fabricType: batch.fabricType,
      color: batch.fabricColor,
    });

    if (!fabric || fabric.quantity < batch.fabricUsed) {
      throw new AppError('Insufficient fabric inventory');
    }

    // Update fabric inventory
    fabric.quantity -= batch.fabricUsed;
    await fabric.save();

    // Update batch status
    batch.status = 'in-production';
    batch.productionStartDate = new Date();
    await batch.save();

    return batch;
  }

  async completeBatch(batchId: string, actualWaste?: number) {
    const batch = await ProductionBatch.findOne({ batchId });
    if (!batch) {
      throw new AppError('Batch not found');
    }

    batch.status = 'completed';
    batch.productionEndDate = new Date();
    if (actualWaste !== undefined) {
      batch.wasteGenerated = actualWaste;
      batch.efficiency = ((batch.fabricUsed - actualWaste) / batch.fabricUsed) * 100;
    }
    await batch.save();

    // Update order statuses
    for (const item of batch.items) {
      await Order.updateOne(
        { _id: item.orderId },
        { orderStatus: 'processing' }
      );
    }

    return batch;
  }

  async getFabricInventory() {
    return await FabricInventory.find().sort({ fabricType: 1, color: 1 });
  }

  async updateFabricInventory(
    fabricType: string,
    color: string,
    quantity: number,
    cost: number,
    source: 'recycled' | 'new'
  ) {
    let fabric = await FabricInventory.findOne({ fabricType, color });

    if (fabric) {
      fabric.quantity += quantity;
      fabric.cost = cost;
      fabric.source = source;
      fabric.sustainabilityScore = source === 'recycled' ? 90 : 50;
    } else {
      fabric = await FabricInventory.create({
        fabricType,
        color,
        quantity,
        cost,
        source,
        sustainabilityScore: source === 'recycled' ? 90 : 50,
      });
    }

    return fabric;
  }
}

