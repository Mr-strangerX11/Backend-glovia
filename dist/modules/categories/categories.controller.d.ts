import { CategoriesService } from './categories.service';
import { AuditLogService } from '../auditlog/auditlog.service';
export declare class CategoriesController {
    private categoriesService;
    private auditLogService;
    constructor(categoriesService: CategoriesService, auditLogService: AuditLogService);
    findAll(): Promise<{
        children: any[];
        _count: {
            products: number;
        };
        name: string;
        slug: string;
        description?: string;
        image?: string;
        type: import("../../database/schemas").ProductCategory;
        parentId?: import("mongoose").Types.ObjectId;
        isActive: boolean;
        displayOrder: number;
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
    }[]>;
    findBySlug(slug: string): Promise<{
        children: (import("../../database/schemas").Category & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        products: {
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
        image?: string;
        type: import("../../database/schemas").ProductCategory;
        parentId?: import("mongoose").Types.ObjectId;
        isActive: boolean;
        displayOrder: number;
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
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Category, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Category & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Category, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Category & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    seed(): Promise<{
        message: string;
        count: number;
        categories?: undefined;
    } | {
        message: string;
        count: number;
        categories: import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../../database/schemas").Category, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Category & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }, Omit<{
            name: string;
            slug: string;
            description: string;
            type: import("../../database/schemas").ProductCategory;
            displayOrder: number;
        }, "_id">>[];
    }>;
}
