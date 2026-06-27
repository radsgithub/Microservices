import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductionBatch, ProductionBatchDocument } from './schemas/production-batch.schema';
import { FabricInventory, FabricInventoryDocument } from './schemas/fabric-inventory.schema';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { UserService } from '../user/user.service';

// Simple production model: each garment uses ~1.5 m of fabric and generates
// ~12% cutting waste. Orders are grouped into batches by fabric type + color.
const FABRIC_PER_ITEM = 1.5;
const WASTE_RATE = 0.12;
const round = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class ProductionService {
    constructor(
        @InjectModel(ProductionBatch.name) private batchModel: Model<ProductionBatchDocument>,
        @InjectModel(FabricInventory.name) private fabricModel: Model<FabricInventoryDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private readonly userService: UserService,
    ) { }

    async assertAdmin(userId: string) {
        const user: any = await this.userService.findById(userId);
        if (!user || user.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }
    }

    getAllBatches() {
        return this.batchModel.find().sort({ createdAt: -1 });
    }

    getPendingBatches() {
        return this.batchModel.find({ status: 'pending' }).sort({ createdAt: -1 });
    }

    // Groups pending orders into production batches by fabric type + color.
    async optimize(orderIds?: string[]) {
        const filter: any = { orderStatus: 'pending' };
        if (orderIds && orderIds.length) filter._id = { $in: orderIds };
        const orders = await this.orderModel.find(filter).lean();

        // cache product lookups
        const productCache = new Map<string, any>();
        const getProduct = async (id: string) => {
            const key = id?.toString();
            if (!productCache.has(key)) {
                productCache.set(key, await this.productModel.findById(id).lean());
            }
            return productCache.get(key);
        };

        // group items by fabricType|fabricColor
        const groups: Record<string, any> = {};
        for (const order of orders as any[]) {
            for (const item of order.items || []) {
                const product = await getProduct(item.productId);
                const fabricType = (product?.fabricInfo && product.fabricInfo.trim())
                    || product?.category || 'Unknown';
                const fabricColor = item.color || 'Default';
                const key = `${fabricType}|${fabricColor}`;
                if (!groups[key]) groups[key] = { fabricType, fabricColor, items: [] };
                groups[key].items.push({
                    orderId: order._id,
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                });
            }
        }

        const created: ProductionBatchDocument[] = [];
        let seq = 0;
        for (const key of Object.keys(groups)) {
            const g = groups[key];
            const totalQty = g.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
            const fabricUsed = round(totalQty * FABRIC_PER_ITEM);
            const wasteGenerated = round(fabricUsed * WASTE_RATE);
            const efficiency = round((1 - WASTE_RATE) * 100);
            const batchId = `BATCH-${Date.now()}-${seq++}`;
            const batch = await this.batchModel.create({
                batchId,
                items: g.items,
                fabricType: g.fabricType,
                fabricColor: g.fabricColor,
                fabricUsed,
                wasteGenerated,
                efficiency,
                status: 'pending',
            });
            created.push(batch);
        }

        // totals + fabric shortage check
        const totalFabricNeeded = round(created.reduce((s, b) => s + b.fabricUsed, 0));
        const totalWaste = round(created.reduce((s, b) => s + b.wasteGenerated, 0));
        const averageEfficiency = created.length
            ? round(created.reduce((s, b) => s + b.efficiency, 0) / created.length)
            : 0;

        const fabricShortage: any[] = [];
        for (const b of created) {
            const stock = await this.fabricModel.findOne({ fabricType: b.fabricType, color: b.fabricColor });
            const available = stock?.quantity || 0;
            if (available < b.fabricUsed) {
                fabricShortage.push({
                    fabricType: b.fabricType,
                    color: b.fabricColor,
                    needed: b.fabricUsed,
                    available,
                });
            }
        }

        return { batches: created, totalFabricNeeded, totalWaste, averageEfficiency, fabricShortage };
    }

    async startBatch(id: string) {
        const batch = await this.batchModel.findById(id);
        if (!batch) throw new NotFoundException('Batch not found');
        if (batch.status !== 'pending') throw new BadRequestException(`Batch is ${batch.status}`);
        batch.status = 'in-production';
        batch.productionStartDate = new Date();
        await batch.save();
        return batch;
    }

    async completeBatch(id: string, actualWaste?: number) {
        const batch = await this.batchModel.findById(id);
        if (!batch) throw new NotFoundException('Batch not found');
        batch.status = 'completed';
        batch.productionEndDate = new Date();
        if (actualWaste != null) batch.wasteGenerated = actualWaste;
        await batch.save();

        // deduct fabric from inventory
        await this.fabricModel.updateOne(
            { fabricType: batch.fabricType, color: batch.fabricColor },
            { $inc: { quantity: -batch.fabricUsed } },
        );
        return batch;
    }

    getFabricInventory() {
        return this.fabricModel.find().sort({ fabricType: 1, color: 1 });
    }

    async upsertFabric(data: { fabricType: string; color: string; quantity: number; cost: number; source: string }) {
        const score = data.source === 'recycled' ? 90 : 50;
        const existing = await this.fabricModel.findOne({ fabricType: data.fabricType, color: data.color });
        if (existing) {
            existing.quantity += data.quantity;
            existing.cost = data.cost;
            existing.source = data.source;
            existing.sustainabilityScore = score;
            await existing.save();
            return existing;
        }
        return this.fabricModel.create({ ...data, sustainabilityScore: score });
    }
}
