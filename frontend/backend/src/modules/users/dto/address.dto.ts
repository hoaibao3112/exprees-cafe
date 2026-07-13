import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home', description: 'Address title (e.g. Home, Office)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the recipient' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: '0912345678', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123 Nguyen Van A', description: 'Street name and number' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Ward 1', description: 'Ward / Commune' })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ example: 'District 1', description: 'District / Town' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Ho Chi Minh City', description: 'City / Province' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: true, description: 'Set as default shipping address' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
