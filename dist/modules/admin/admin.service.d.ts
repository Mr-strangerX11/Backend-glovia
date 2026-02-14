import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../database/schemas/user.schema';
import { Product } from '../../database/schemas/product.schema';
import { Order, OrderStatus } from '../../database/schemas/order.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { Review } from '../../database/schemas/review.schema';
import { Category } from '../../database/schemas/category.schema';
import { Brand } from '../../database/schemas/brand.schema';
import { ProductImage } from '../../database/schemas/product-image.schema';
import { Setting } from '../../database/schemas/setting.schema';
import { Address } from '../../database/schemas/address.schema';
import { CreateUserDto } from './dto/user.dto';
import { UpdateProductDto, CreateProductDto } from './dto/product.dto';
import { EmailNotificationService } from '../../common/services/email-notification.service';
export declare class AdminService {
    private userModel;
    private productModel;
    private orderModel;
    private orderItemModel;
    private reviewModel;
    private categoryModel;
    private brandModel;
    private productImageModel;
    private settingModel;
    private addressModel;
    private emailNotificationService;
    constructor(userModel: Model<User>, productModel: Model<Product>, orderModel: Model<Order>, orderItemModel: Model<OrderItem>, reviewModel: Model<Review>, categoryModel: Model<Category>, brandModel: Model<Brand>, productImageModel: Model<ProductImage>, settingModel: Model<Setting>, addressModel: Model<Address>, emailNotificationService: EmailNotificationService);
    getDashboard(): Promise<{
        totalOrders: number;
        totalRevenue: any;
        totalCustomers: number;
        totalProducts: number;
        recentOrders: {
            user: any;
            orderNumber: string;
            userId: Types.ObjectId;
            addressId: Types.ObjectId;
            subtotal: number;
            discount: number;
            deliveryCharge: number;
            total: number;
            status: OrderStatus;
            paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
            paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
            customerNote?: string;
            adminNote?: string;
            trackingNumber?: string;
            deliveryPartner?: string;
            confirmedAt?: Date;
            shippedAt?: Date;
            deliveredAt?: Date;
            cancelledAt?: Date;
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
        topProducts: {
            product: any;
            totalSold: any;
        }[];
        revenueByMonth: any[];
    }>;
    createUser(createUserDto: CreateUserDto): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllUsers(page?: number, limit?: number, role?: UserRole): Promise<{
        data: {
            id: string;
            email: string;
            phone?: string;
            password: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            skinType?: import("../../database/schemas/user.schema").SkinType;
            profileImage?: string;
            refreshToken?: string;
            trustScore: number;
            deviceFingerprint?: string;
            ipAddress?: string;
            failedAttempts: number;
            isBlocked: boolean;
            lastLoginAt?: Date;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateUserRole(userId: string, role: UserRole, adminRole: UserRole): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteUser(userId: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllProducts(page?: number, limit?: number, categoryId?: string, brandId?: string): Promise<{
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
            lowStockThreshold: number;
            weight?: number;
            categoryId: Types.ObjectId;
            brandId?: Types.ObjectId;
            suitableFor: import("../../database/schemas/user.schema").SkinType[];
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProduct(productId: string): Promise<{
        images: (ProductImage & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        category: Category & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
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
        lowStockThreshold: number;
        weight?: number;
        categoryId: Types.ObjectId;
        brandId?: Types.ObjectId;
        suitableFor: import("../../database/schemas/user.schema").SkinType[];
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
    }>;
    createProduct(createProductDto: CreateProductDto): Promise<import("mongoose").Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProduct(productId: string, updateProductDto: UpdateProductDto): Promise<Product & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteProduct(productId: string): Promise<Product & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllOrders(page?: number, limit?: number, status?: OrderStatus): Promise<{
        data: {
            user: any;
            items: any[];
            orderNumber: string;
            userId: Types.ObjectId;
            addressId: Types.ObjectId;
            subtotal: number;
            discount: number;
            deliveryCharge: number;
            total: number;
            status: OrderStatus;
            paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
            paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
            customerNote?: string;
            adminNote?: string;
            trackingNumber?: string;
            deliveryPartner?: string;
            confirmedAt?: Date;
            shippedAt?: Date;
            deliveredAt?: Date;
            cancelledAt?: Date;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private sendOrderConfirmationEmail;
    getAllCustomers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            orderCount: any;
            totalSpent: any;
            email: string;
            phone?: string;
            password: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            skinType?: import("../../database/schemas/user.schema").SkinType;
            profileImage?: string;
            refreshToken?: string;
            trustScore: number;
            deviceFingerprint?: string;
            ipAddress?: string;
            failedAttempts: number;
            isBlocked: boolean;
            lastLoginAt?: Date;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAllReviews(page?: number, limit?: number, approved?: boolean): Promise<{
        data: {
            user: any;
            product: any;
            productId: Types.ObjectId;
            userId: Types.ObjectId;
            rating: number;
            title?: string;
            comment: string;
            isVerified: boolean;
            isApproved: boolean;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveReview(reviewId: string): Promise<Review & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteReview(reviewId: string): Promise<Review & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateDeliverySettings(data: {
        freeDeliveryThreshold: number;
        valleyDeliveryCharge: number;
        outsideValleyDeliveryCharge: number;
    }): Promise<Setting & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDeliverySettings(): Promise<any>;
    updateAnnouncementBar(data: {
        enabled?: boolean;
        message?: string;
        backgroundColor?: string;
        textColor?: string;
    }): Promise<Setting & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAnnouncementBar(): Promise<any>;
    updateDiscountSettings(data: {
        enabled: boolean;
        percentage?: number;
        minOrderAmount?: number;
    }): Promise<Setting & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDiscountSettings(): Promise<any>;
    getAllCategories(): Promise<{
        data: (Category & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
        message: string;
    }>;
    seedInitialUsers(): Promise<any[]>;
    fixSuperAdminRole(): Promise<{
        email: string;
        role: UserRole.SUPER_ADMIN;
        status: string;
        oldRole?: undefined;
        newRole?: undefined;
    } | {
        email: string;
        oldRole: UserRole.CUSTOMER | UserRole.ADMIN | UserRole.VENDOR;
        newRole: UserRole;
        status: string;
        role?: undefined;
    }>;
}
