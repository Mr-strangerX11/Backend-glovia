import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, example: '🚚 Express Delivery: We deliver within 60 minutes!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({ required: false, example: '🚚 Express Delivery: We deliver within 60 minutes!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  text?: string;

  @ApiProperty({ required: false, example: '🚚' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiProperty({ required: false, example: '#0066CC' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  backgroundColor?: string;

  @ApiProperty({ required: false, example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  textColor?: string;
}
