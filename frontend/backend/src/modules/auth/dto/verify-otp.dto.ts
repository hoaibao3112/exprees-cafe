import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'a9b8c7d6-e5f4-3210-abcd-ef0123456789', description: 'User UUID' })
  @IsUUID('4', { message: 'Invalid User ID format' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  @IsNotEmpty()
  code: string;
}
