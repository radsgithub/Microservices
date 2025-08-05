import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCartDto } from './dtos/create.dto';

@ApiTags("Cart")
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // Add or update cart
    @Post('add')
    async addToCart(
        @Body() body: CreateCartDto,
    ) {
        return this.cartService.addToCart(body);
    }

    // Get cart by user ID
    @Get(':userId')
    async getCart(@Param('userId') userId: string) {

        return this.cartService.getCart(userId);
    }

    // Checkout
    @Post(':userId/checkout')
    async checkout(@Param('userId') userId: string) {
        return this.cartService.checkout(userId);
    }
}
