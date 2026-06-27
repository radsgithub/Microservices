import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Body for PUT /cart/update/:itemId
export class UpdateCartItemDto {
    @ApiProperty({ required: false })
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
