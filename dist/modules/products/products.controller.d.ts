import { ProductsService } from './products.service';
import { AuditLogService } from '../auditlog/auditlog.service';
import { SkinType } from '../../database/schemas/user.schema';
export declare class ProductsController {
    private productsService;
    private auditLogService;
    constructor(productsService: ProductsService, auditLogService: AuditLogService);
    getVariants(productId: string): Promise<(import("../../database/schemas").ProductVariant & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createVariant(productId: string, dto: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").ProductVariant, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").ProductVariant & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateVariant(productId: string, variantId: string, dto: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").ProductVariant, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").ProductVariant & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }> | {
        message: string;
    } | Promise<{
        data: {
            images: any[];
            category: any;
            brand: any;
            averageRating: number;
            reviewCount: any;
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
            categoryId: import("mongoose").Types.ObjectId;
            brandId?: import("mongoose").Types.ObjectId;
            suitableFor: SkinType[];
            isActive: boolean;
            isFeatured: boolean;
            isBestSeller: boolean;
            isNewProduct: boolean;
            metaTitle?: string;
            metaDescription?: string;
            tags: string[];
            _id: import("mongoose").Types.ObjectId;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> | Promise<{
        images: any[];
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
        categoryId: import("mongoose").Types.ObjectId;
        brandId?: import("mongoose").Types.ObjectId;
        suitableFor: SkinType[];
        isActive: boolean;
        isFeatured: boolean;
        isBestSeller: boolean;
        isNewProduct: boolean;
        metaTitle?: string;
        metaDescription?: string;
        tags: string[];
        _id: import("mongoose").Types.ObjectId;
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
    }[]> | Promise<{
        images: (import("../../database/schemas").ProductImage & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        category: import("../../database/schemas").Category & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        brand: import("../../database/schemas").Brand & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        reviews: {
            user: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            userId: import("mongoose").Types.ObjectId;
            rating: number;
            title?: string;
            comment: string;
            isVerified: boolean;
            isApproved: boolean;
            _id: import("mongoose").Types.ObjectId;
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
        averageRating: number;
        reviewCount: number;
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
        categoryId: import("mongoose").Types.ObjectId;
        brandId?: import("mongoose").Types.ObjectId;
        suitableFor: SkinType[];
        isActive: boolean;
        isFeatured: boolean;
        isBestSeller: boolean;
        isNewProduct: boolean;
        metaTitle?: string;
        metaDescription?: string;
        tags: string[];
        _id: import("mongoose").Types.ObjectId;
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
}
