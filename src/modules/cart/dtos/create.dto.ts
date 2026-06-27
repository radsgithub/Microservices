import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Body for POST /cart/add. userId comes from the JWT, NOT the body.
export class AddToCartDto {
    @ApiProperty()
    @IsMongoId()
    productId!: string;

    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    size?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    color?: string;
}
