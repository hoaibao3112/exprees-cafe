import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
