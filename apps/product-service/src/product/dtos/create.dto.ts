import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsNumber()
    price!: number;

    @ApiProperty()
    @IsNumber()
    quantity!: number;

    @ApiProperty()
    @IsNumber()
    stock!: number;

    @ApiProperty()
    category!: string;

    @ApiProperty()
    description!: string;
}
