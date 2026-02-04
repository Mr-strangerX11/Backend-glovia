import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiProperty({ example: '🚚 Express Delivery: We deliver within 60 minutes!' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  text: string;

  @ApiProperty({ example: '🚚' })
  @IsString()
  @MaxLength(5)
  icon: string;

  @ApiProperty({ example: '#0066CC' })
  @IsString()
  @MaxLength(7)
  backgroundColor: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

export class GetAnnouncementDto {
  id: string;
  text: string;
  icon: string;
  backgroundColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
