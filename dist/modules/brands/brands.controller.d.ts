import { BrandsService } from './brands.service';
import { AuditLogService } from '../auditlog/auditlog.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    private readonly auditLogService;
    constructor(brandsService: BrandsService, auditLogService: AuditLogService);
    getAllBrands(): Promise<{
        success: boolean;
        data: (import("../../database/schemas").Brand & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[] | {
            products: any;
            name: string;
            slug: string;
            description?: string;
            logo?: string;
            isActive: boolean;
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
    }>;
    getBrandsList(): Promise<{
        success: boolean;
        data: (import("../../database/schemas").Brand & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getBrandBySlug(slug: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            products: {
                images: any[];
                brand: import("../../database/schemas").Brand & Required<{
                    _id: import("mongoose").Types.ObjectId;
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
                categoryId: import("mongoose").Types.ObjectId;
                brandId?: import("mongoose").Types.ObjectId;
                suitableFor: import("../../database/schemas/user.schema").SkinType[];
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
            name: string;
            slug: string;
            description?: string;
            logo?: string;
            isActive: boolean;
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
        };
        message?: undefined;
    }>;
    createBrand(dto: CreateBrandDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../../database/schemas").Brand, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Brand & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    updateBrand(id: string, dto: UpdateBrandDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../../database/schemas").Brand, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Brand & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    deleteBrand(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getBrandAnalytics(): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
