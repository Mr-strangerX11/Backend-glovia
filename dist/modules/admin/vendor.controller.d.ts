import { AdminService } from './admin.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { UploadService } from '../upload/upload.service';
export declare class VendorController {
    private adminService;
    private uploadService;
    constructor(adminService: AdminService, uploadService: UploadService);
    private parseProductFormData;
    getProducts(search?: string, page?: string, limit?: string): Promise<{
        data: {
            images: any[];
            category: any;
            brand: any;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProduct(id: string): Promise<{
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
    }>;
    createProduct(dto: CreateProductDto): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Product, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Product & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createProductWithImages(files: Express.Multer.File[], body: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Product, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Product & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProduct(id: string, dto: UpdateProductDto): Promise<import("../../database/schemas").Product & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProductWithImages(id: string, files: Express.Multer.File[], body: any): Promise<import("../../database/schemas").Product & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteProduct(id: string): Promise<import("../../database/schemas").Product & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
