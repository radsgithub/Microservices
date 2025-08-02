import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        { message: 'Password too weak. Must include uppercase, lowercase, number, and symbol.' }
    )
    password!: string;

    @ApiProperty({
        example: 'Radhika',
        description: 'First name of the user',
        required: false,
    })
    firstName!: string;

    @ApiProperty({
        example: 'Sharma',
        description: 'Last name of the user',
        required: false,
    })
    lastName!: string;

    @ApiProperty({
        example: '+91-9876543210',
        description: 'Mobile number with country code',
        required: false,
    })
    phone!: string;
}
