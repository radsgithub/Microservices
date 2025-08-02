import { IsMongoId, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CartItemDto {
    @ApiProperty()
    @IsMongoId()
    productId!: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity!: number;
}

export class CreateCartDto {
    @ApiProperty()
    @IsMongoId()
    userId!: string;

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    items!: CartItemDto[];
}
