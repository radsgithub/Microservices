import { Controller, Post, Get, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AddToCartDto } from './dtos/create.dto';
import { UpdateCartItemDto } from './dtos/update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// All cart routes are scoped to the authenticated user (userId from the JWT).
@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@Req() req: any) {
        return this.cartService.getCart(req.userId);
    }

    @Post('add')
    addToCart(@Req() req: any, @Body() body: AddToCartDto) {
        return this.cartService.addToCart(req.userId, body);
    }

    @Put('update/:itemId')
    updateItem(@Req() req: any, @Param('itemId') itemId: string, @Body() body: UpdateCartItemDto) {
        return this.cartService.updateItem(req.userId, itemId, body);
    }

    @Delete('remove/:itemId')
    removeItem(@Req() req: any, @Param('itemId') itemId: string) {
        return this.cartService.removeItem(req.userId, itemId);
    }
}
