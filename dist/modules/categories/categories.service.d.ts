import { Model, Types } from 'mongoose';
import { Category, Product, ProductImage, ProductCategory } from '../../database/schemas';
export declare class CategoriesService {
    private categoryModel;
    private productModel;
    private productImageModel;
    constructor(categoryModel: Model<Category>, productModel: Model<Product>, productImageModel: Model<ProductImage>);
    findAll(): Promise<{
        children: any[];
        _count: {
            products: number;
        };
        name: string;
        slug: string;
        description?: string;
        image?: string;
        type: ProductCategory;
        parentId?: Types.ObjectId;
        isActive: boolean;
        displayOrder: number;
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
    findBySlug(slug: string): Promise<{
        children: (Category & Required<{
            _id: Types.ObjectId;
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
        image?: string;
        type: ProductCategory;
        parentId?: Types.ObjectId;
        isActive: boolean;
        displayOrder: number;
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
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    seedInitialCategories(): Promise<{
        message: string;
        count: number;
        categories?: undefined;
    } | {
        message: string;
        count: number;
        categories: import("mongoose").MergeType<import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }, Omit<{
            name: string;
            slug: string;
            description: string;
            type: ProductCategory;
            displayOrder: number;
        }, "_id">>[];
    }>;
}
