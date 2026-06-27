import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetRateDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    courier?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    from?: string;

    @ApiProperty({ required: false, description: 'Destination country (e.g. US)' })
    @IsOptional()
    @IsString()
    to?: string;

    // Full destination address — used for accurate live (Shippo) rates.
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    toStreet?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    toCity?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    toState?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    toPostalCode?: string;

    @ApiProperty({ required: false, description: 'Weight in pounds (lb)' })
    @IsOptional()
    @IsNumber()
    weight?: number;

    @ApiProperty({ required: false, description: 'Length in inches' })
    @IsOptional()
    @IsNumber()
    length?: number;

    @ApiProperty({ required: false, description: 'Width in inches' })
    @IsOptional()
    @IsNumber()
    width?: number;

    @ApiProperty({ required: false, description: 'Height in inches' })
    @IsOptional()
    @IsNumber()
    height?: number;
}
