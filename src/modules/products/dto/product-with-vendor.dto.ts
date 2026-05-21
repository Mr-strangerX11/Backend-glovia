import { IsString, IsNumber, IsOptional, IsArray, IsMongoId, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

// ===== PRODUCT CREATION DTOS =====

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  howToUse?: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costPrice?: number;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNumber()
  @Type(() => Number)
  stockQuantity: number;

  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suitableFor?: string[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * DTO for admin/superadmin creating product for a vendor
 * Extends CreateProductDto and adds vendor selection
 */
export class CreateProductAsAdminDto extends CreateProductDto {
  @IsMongoId()
  vendorId: string; // Admin must select vendor

  @IsOptional()
  @IsString()
  vendorName?: string; // Optional - will be fetched from DB

  @IsOptional()
  @IsEmail()
  vendorEmail?: string; // Optional - will be fetched from DB

  @IsOptional()
  @IsString()
  vendorPhone?: string; // Optional - will be fetched from DB
}

// ===== BULK UPLOAD DTOS =====

export class BulkProductUploadDto {
  @IsOptional()
  @IsMongoId()
  vendorId?: string; // If specified, all products in file belong to this vendor

  // File will be handled by middleware
}

export class BulkUploadResult {
  successCount: number;
  failedCount: number;
  failedRows: {
    row: number;
    reason: string;
  }[];
}
