import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AddAddressDto {
    @ApiProperty({
        example: '123 Main Street',
        description: 'Street address',
    })
    @IsString()
    @IsNotEmpty({ message: 'Street address is required' })
    street!: string;

    @ApiProperty({
        example: 'Apt 4B',
        description: 'Apartment or unit number',
        required: false,
    })
    @IsString()
    @IsOptional()
    apartment?: string;

    @ApiProperty({
        example: 'New York',
        description: 'City name',
    })
    @IsString()
    @IsNotEmpty({ message: 'City is required' })
    city!: string;

    @ApiProperty({
        example: 'NY',
        description: 'State or province',
    })
    @IsString()
    @IsNotEmpty({ message: 'State is required' })
    state!: string;

    @ApiProperty({
        example: '10001',
        description: 'ZIP or postal code',
    })
    @IsString()
    @IsNotEmpty({ message: 'ZIP code is required' })
    zipCode!: string;

    @ApiProperty({
        example: 'USA',
        description: 'Country name',
    })
    @IsString()
    @IsNotEmpty({ message: 'Country is required' })
    country!: string;

    @ApiProperty({
        example: 'Home',
        description: 'Address label (Home, Work, etc.)',
    })
    @IsString()
    @IsNotEmpty({ message: 'Address label is required' })
    label!: string;
}

export class UpdateAddressDto extends AddAddressDto {
    @ApiProperty({
        example: '0',
        description: 'Index of the address to update',
    })
    @IsNotEmpty({ message: 'Address index is required' })
    addressIndex!: number;
} 