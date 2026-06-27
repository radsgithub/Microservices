import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Address line 1 is required' })
    line1!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    line2?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'City is required' })
    city!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'State is required' })
    state!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Country is required' })
    country!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Postal code is required' })
    postalCode!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
