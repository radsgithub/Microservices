import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

// Body for POST /order/create. The order's items come from the user's cart;
// the client just provides the shipping address + chosen shipping option.
export class CreateOrderDto {
    @ApiProperty()
    @IsMongoId()
    shippingAddressId!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    cartId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    aiPredictionId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    shippingCost?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shippingCourier?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shippingServiceName?: string;
}
