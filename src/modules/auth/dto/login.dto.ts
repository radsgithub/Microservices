import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    // No length/strength rules here — login must accept whatever password the
    // account was created with (policy is enforced at registration only).
    @ApiProperty({ example: 'Password123', description: 'Account password' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
}
