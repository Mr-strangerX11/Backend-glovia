import { SkinType } from '../../../database/schemas/user.schema';
export declare class CreateProductDto {
    name: string;
    slug: string;
    description: string;
    ingredients?: string;
    benefits?: string;
    howToUse?: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockQuantity: number;
    categoryId: string;
    brandId?: string;
    suitableFor?: SkinType[];
    images?: string[];
    tags?: string[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNew?: boolean;
    discountPercentage?: number;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    images?: string[];
    discountPercentage?: number;
}
