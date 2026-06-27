import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create.dto';
import { UpdateProductDto } from './dtos/update.dto';

// The gRPC handler (@GrpcMethod 'ProductService.FindOne') was removed — order
// and cart now call ProductService.getById() directly.
@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @ApiOperation({ summary: 'Get all products (optionally filtered by category/search)' })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'search', required: false })
    getAllProducts(
        @Query('category') category?: string,
        @Query('search') search?: string,
    ) {
        return this.productService.getAll({ category, search });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    getProductById(@Param('id') id: string) {
        return this.productService.getById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a product (admin only)' })
    createProduct(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a product by ID (admin only)' })
    updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product by ID (admin only)' })
    deleteProduct(@Param('id') id: string) {
        return this.productService.delete(id);
    }
}
