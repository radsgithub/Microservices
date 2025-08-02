import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create.dto';
import { UpdateProductDto } from './dtos/update.dto';
import { GrpcMethod } from '@nestjs/microservices';
// import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    getAllProducts() {
        return this.productService.getAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    getProductById(@Param('id') id: string) {
        return this.productService.getById(id);
    }

    @Post()
    // @ApiBearerAuth()
    // @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Create a product (admin only)' })
    createProduct(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @Put(':id')
    // @ApiBearerAuth()
    // @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Update a product by ID (admin only)' })
    updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productService.update(id, dto);
    }

    @Delete(':id')
    // @ApiBearerAuth()
    // @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Delete a product by ID (admin only)' })
    deleteProduct(@Param('id') id: string) {
        return this.productService.delete(id);
    }

    @GrpcMethod('ProductService', 'FindOne')
    findProductById(data: { productId: string }) {
        console.log(data, "herre");
        return this.productService.getById(data.productId);
    }
}
