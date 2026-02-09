import { IsNumber, Min, IsBoolean, IsOptional, IsNotEmpty, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDeliverySettingsDto {
  @ApiProperty({ description: 'Delivery charge in NPR', example: 150 })
  @IsNotEmpty({ message: 'Delivery charge is required' })
  @IsNumber({}, { message: 'charge must be a number conforming to the specified constraints' })
  @Type(() => Number)
  @Min(0, { message: 'charge must not be less than 0' })
  charge: number;
}

export class UpdateDiscountSettingsDto {
  @ApiProperty({ description: 'Enable or disable discount', example: true })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @ApiProperty({ required: false, description: 'Discount percentage (0-100)', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'percentage must be a number conforming to the specified constraints' })
  @Type(() => Number)
  @Min(0, { message: 'percentage must not be less than 0' })
  @Max(100, { message: 'percentage cannot exceed 100' })
  percentage?: number;

  @ApiProperty({ required: false, description: 'Minimum order amount for discount in NPR', example: 1000 })
  @IsOptional()
  @IsNumber({}, { message: 'minOrderAmount must be a number conforming to the specified constraints' })
  @Type(() => Number)
  @Min(0, { message: 'minOrderAmount must not be less than 0' })
  minOrderAmount?: number;
}
