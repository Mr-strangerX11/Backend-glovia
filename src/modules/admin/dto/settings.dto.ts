import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDeliverySettingsDto {
  @ApiProperty({ required: false, description: 'Free delivery threshold in NPR' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  freeDeliveryThreshold?: number;

  @ApiProperty({ required: false, description: 'Valley delivery charge in NPR' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  valleyDeliveryCharge?: number;

  @ApiProperty({ required: false, description: 'Outside valley delivery charge in NPR' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  outsideValleyDeliveryCharge?: number;
}

export class GetDeliverySettingsDto {
  freeDeliveryThreshold: number;
  valleyDeliveryCharge: number;
  outsideValleyDeliveryCharge: number;
}
