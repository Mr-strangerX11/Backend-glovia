import { Model, Types } from 'mongoose';
import { Brand, Product, ProductImage, OrderItem } from '../../database/schemas';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsService {
    private brandModel;
    private productModel;
    private productImageModel;
    private orderItemModel;
    constructor(brandModel: Model<Brand>, productModel: Model<Product>, productImageModel: Model<ProductImage>, orderItemModel: Model<OrderItem>);
    getAllBrands(includeProducts?: boolean): Promise<(Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[] | {
        products: any;
        name: string;
        slug: string;
        description?: string;
        logo?: string;
        isActive: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
    getBrandBySlug(slug: string): Promise<{
        products: {
            images: any[];
            brand: Brand & Required<{
                _id: Types.ObjectId;
            }> & {
                __v: number;
            };
            name: string;
            slug: string;
            description: string;
            ingredients?: string;
            benefits?: string;
            howToUse?: string;
            price: number;
            compareAtPrice?: number;
            costPrice?: number;
            sku: string;
            barcode?: string;
            stockQuantity: number;
            quantityMl?: number;
            lowStockThreshold: number;
            weight?: number;
            categoryId: Types.ObjectId;
            brandId?: Types.ObjectId;
            suitableFor: import("../../database/schemas").SkinType[];
            isActive: boolean;
            isFeatured: boolean;
            isBestSeller: boolean;
            isNewProduct: boolean;
            metaTitle?: string;
            metaDescription?: string;
            tags: string[];
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        name: string;
        slug: string;
        description?: string;
        logo?: string;
        isActive: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getBrandById(id: string): Promise<{
        _count: {
            products: number;
        };
        products: {
            id: Types.ObjectId;
        }[];
        name: string;
        slug: string;
        description?: string;
        logo?: string;
        isActive: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    createBrand(dto: CreateBrandDto): Promise<import("mongoose").Document<unknown, {}, Brand, {}, import("mongoose").DefaultSchemaOptions> & Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateBrand(id: string, dto: UpdateBrandDto): Promise<import("mongoose").Document<unknown, {}, Brand, {}, import("mongoose").DefaultSchemaOptions> & Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteBrand(id: string): Promise<import("mongoose").Document<unknown, {}, Brand, {}, import("mongoose").DefaultSchemaOptions> & Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    hardDeleteBrand(id: string): Promise<import("mongoose").Document<unknown, {}, Brand, {}, import("mongoose").DefaultSchemaOptions> & Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getBrandAnalytics(): Promise<{
        totalBrands: number;
        activeBrands: number;
        topBrands: {
            id: any;
            name: any;
            logo: any;
            productCount: any;
        }[];
        brandPerformance: {
            id: any;
            name: any;
            logo: any;
            productCount: any;
            revenue: any;
        }[];
    }>;
    getBrandsList(): Promise<(Brand & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
