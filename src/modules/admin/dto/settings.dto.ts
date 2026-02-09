import { IsNumber, Min, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDeliverySettingsDto {
  @ApiProperty({ description: 'Delivery charge in NPR', example: 150 })
  @IsNotEmpty({ message: 'Delivery charge is required' })
  @IsNumber({}, { message: 'Delivery charge must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Delivery charge cannot be negative' })
  charge: number;
}

export class UpdateDiscountSettingsDto {
  @ApiProperty({ description: 'Enable or disable discount', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ required: false, description: 'Discount percentage (0-100)', example: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  percentage?: number;

  @ApiProperty({ required: false, description: 'Minimum order amount for discount in NPR', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minOrderAmount?: number;
}
