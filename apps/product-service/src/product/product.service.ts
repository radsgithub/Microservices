import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dtos/create.dto';
import { UpdateProductDto } from './dtos/update.dto';
@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async getAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    async getById(id: string): Promise<Product> {
        const product = await this.productModel.findById({ _id: id }).exec();
        console.log("product", product, id)
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async create(dto: CreateProductDto): Promise<Product> {
        const newProduct = new this.productModel(dto);
        return newProduct.save();
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        const updatedProduct = await this.productModel.findByIdAndUpdate(id, dto, {
            new: true,
        }).exec();

        if (!updatedProduct) {
            throw new NotFoundException('Product not found for update');
        }

        return updatedProduct;
    }

    async delete(id: string): Promise<{ message: string }> {
        const result = await this.productModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException('Product not found for deletion');
        }

        return { message: 'Product deleted successfully' };
    }
}
