import { AdminService } from './admin.service';
import { UserRole } from '../../database/schemas/user.schema';
import { OrderStatus } from '../../database/schemas/order.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { UpdateOrderDto } from './dto/order.dto';
import { UpdateDeliverySettingsDto, UpdateDiscountSettingsDto } from './dto/settings.dto';
import { UpdateAnnouncementDto } from './dto/announcement.dto';
import { UploadService } from '../upload/upload.service';
export declare class AdminController {
    private adminService;
    private uploadService;
    constructor(adminService: AdminService, uploadService: UploadService);
    private parseProductFormData;
    getDashboard(): Promise<{
        totalOrders: number;
        totalRevenue: any;
        totalCustomers: number;
        totalProducts: number;
        recentOrders: {
            user: any;
            orderNumber: string;
            userId: import("mongoose").Types.ObjectId;
            addressId: import("mongoose").Types.ObjectId;
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
        topProducts: {
            product: any;
            totalSold: any;
        }[];
        revenueByMonth: any[];
    }>;
    createUser(dto: CreateUserDto): Promise<import("../../database/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateUserRole(id: string, dto: UpdateUserRoleDto, actorRole: UserRole): Promise<import("../../database/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteUser(id: string): Promise<import("../../database/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
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
    getAllOrders(status?: string, page?: string, limit?: string): Promise<{
        data: {
            user: any;
            items: any[];
            orderNumber: string;
            userId: import("mongoose").Types.ObjectId;
            addressId: import("mongoose").Types.ObjectId;
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
    updateOrder(id: string, dto: UpdateOrderDto): Promise<import("../../database/schemas/order.schema").Order & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllCustomers(page?: string, limit?: string): Promise<{
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
    getAllReviews(isApproved?: string, page?: string, limit?: string): Promise<{
        data: {
            user: any;
            product: any;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveReview(id: string): Promise<import("../../database/schemas").Review & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteReview(id: string): Promise<import("../../database/schemas").Review & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDeliverySettings(): Promise<{
        charge: number;
    }>;
    updateDeliverySettings(dto: UpdateDeliverySettingsDto): Promise<{
        charge: number;
        message: string;
    }>;
    getAnnouncement(): Promise<any>;
    updateAnnouncement(dto: UpdateAnnouncementDto): Promise<import("../../database/schemas").Setting & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDiscountSettings(): Promise<any>;
    updateDiscountSettings(dto: UpdateDiscountSettingsDto): Promise<import("../../database/schemas").Setting & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    initializeUsers(): Promise<{
        status: string;
        message: string;
        data: any[];
    } | {
        status: string;
        message: any;
        data?: undefined;
    }>;
    fixSuperAdmin(): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data?: undefined;
    }>;
}
