import { Type } from 'class-transformer';
import {
    ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional,
    IsString, Min, ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
    @IsString() @IsNotEmpty()
    productId!: string;

    @IsNumber()
    variantId!: number;

    @IsInt() @Min(1)
    quantity!: number;
}

export class ShippingDto {
    @IsString() @IsNotEmpty() firstName!: string;
    @IsString() @IsNotEmpty() lastName!: string;
    @IsString() @IsNotEmpty() email!: string;
    @IsString() @IsNotEmpty() phone!: string;
    @IsString() @IsNotEmpty() address1!: string;
    @IsOptional() @IsString() address2?: string;
    @IsString() @IsNotEmpty() city!: string;
    @IsString() @IsNotEmpty() region!: string;
    @IsString() @IsNotEmpty() zip!: string;
    @IsString() @IsNotEmpty() country!: string;
}

export class CheckoutDto {
    @IsArray() @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items!: CheckoutItemDto[];

    @ValidateNested()
    @Type(() => ShippingDto)
    shipping!: ShippingDto;
}
