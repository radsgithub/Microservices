import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dtos/create.dto';
import { UpdateCartItemDto } from './dtos/update.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    ) { }

    // Returns the user's cart with product details populated (matches the
    // frontend's expected shape: items[].productId = { _id, name, price, images }).
    private async populatedCart(userId: string) {
        return this.cartModel
            .findOne({ userId })
            .populate('items.productId', 'name price images');
    }

    private async getOrCreate(userId: string): Promise<CartDocument> {
        let cart = await this.cartModel.findOne({ userId });
        if (!cart) {
            cart = await this.cartModel.create({ userId, items: [] });
        }
        return cart;
    }

    async getCart(userId: string) {
        const cart = await this.populatedCart(userId);
        return cart || this.cartModel.create({ userId, items: [] });
    }

    // Empties the cart (used after an order is placed).
    async clearCart(userId: string) {
        await this.cartModel.updateOne({ userId }, { $set: { items: [] } });
    }

    async addToCart(userId: string, dto: AddToCartDto) {
        const cart = await this.getOrCreate(userId);

        // Merge with an existing line that has the same product + size + color.
        const existing = cart.items.find(
            (i) =>
                i.productId.toString() === dto.productId &&
                (i.size || '') === (dto.size || '') &&
                (i.color || '') === (dto.color || ''),
        );

        if (existing) {
            existing.quantity += dto.quantity || 1;
        } else {
            cart.items.push({
                productId: new Types.ObjectId(dto.productId),
                quantity: dto.quantity || 1,
                size: dto.size,
                color: dto.color,
            } as any);
        }

        await cart.save();
        return this.populatedCart(userId);
    }

    async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
        const cart = await this.getOrCreate(userId);
        const item = (cart.items as any).id(itemId);
        if (!item) {
            throw new NotFoundException('Cart item not found');
        }
        if (dto.quantity != null) item.quantity = dto.quantity;
        if (dto.size != null) item.size = dto.size;
        if (dto.color != null) item.color = dto.color;
        await cart.save();
        return this.populatedCart(userId);
    }

    async removeItem(userId: string, itemId: string) {
        const cart = await this.getOrCreate(userId);
        cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId) as any;
        await cart.save();
        return this.populatedCart(userId);
    }
}
