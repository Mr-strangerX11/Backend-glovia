"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const common_2 = require("@nestjs/common");
const user_schema_1 = require("../../database/schemas/user.schema");
const product_dto_1 = require("./dto/product.dto");
const user_dto_1 = require("./dto/user.dto");
const order_dto_1 = require("./dto/order.dto");
const settings_dto_1 = require("./dto/settings.dto");
const announcement_dto_1 = require("./dto/announcement.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const upload_service_1 = require("../upload/upload.service");
let AdminController = class AdminController {
    constructor(adminService, uploadService) {
        this.adminService = adminService;
        this.uploadService = uploadService;
    }
    parseProductFormData(body) {
        const parseNumber = (value) => {
            if (value === undefined || value === null || value === '')
                return undefined;
            const num = Number(value);
            return Number.isNaN(num) ? undefined : num;
        };
        const parseBoolean = (value) => {
            if (value === true || value === false)
                return value;
            if (typeof value === 'string')
                return value.toLowerCase() === 'true';
            return undefined;
        };
        const parseArray = (value) => {
            if (!value)
                return undefined;
            if (Array.isArray(value))
                return value;
            if (typeof value === 'string') {
                return value
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
            return undefined;
        };
        return {
            ...body,
            price: parseNumber(body.price),
            compareAtPrice: parseNumber(body.compareAtPrice),
            stockQuantity: parseNumber(body.stockQuantity),
            discountPercentage: parseNumber(body.discountPercentage),
            isFeatured: parseBoolean(body.isFeatured),
            isBestSeller: parseBoolean(body.isBestSeller),
            isNew: parseBoolean(body.isNew),
            suitableFor: parseArray(body.suitableFor),
            tags: parseArray(body.tags),
        };
    }
    getDashboard() {
        return this.adminService.getDashboard();
    }
    getAllUsers(page, limit, role) {
        return this.adminService.getAllUsers(page, limit, role);
    }
    createUser(dto) {
        return this.adminService.createUser(dto);
    }
    updateUserRole(id, dto, actorRole) {
        return this.adminService.updateUserRole(id, dto.role, actorRole);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    createProduct(dto) {
        return this.adminService.createProduct(dto);
    }
    async createProductWithImages(files, body) {
        const payload = this.parseProductFormData(body);
        if (files && files.length > 0) {
            const urls = await this.uploadService.uploadMultiple(files, 'products');
            payload.images = urls;
        }
        return this.adminService.createProduct(payload);
    }
    updateProduct(id, dto) {
        return this.adminService.updateProduct(id, dto);
    }
    async updateProductWithImages(id, files, body) {
        const payload = this.parseProductFormData(body);
        if (files && files.length > 0) {
            const urls = await this.uploadService.uploadMultiple(files, 'products');
            payload.images = urls.map((url, index) => ({
                url,
                isPrimary: index === 0,
            }));
        }
        return this.adminService.updateProduct(id, payload);
    }
    deleteProduct(id) {
        return this.adminService.deleteProduct(id);
    }
    getAllOrders(status, page, limit) {
        return this.adminService.getAllOrders(page ? Number(page) : 1, limit ? Number(limit) : 10, status);
    }
    updateOrder(id, dto) {
        return this.adminService.updateOrderStatus(id, dto.status);
    }
    getAllCustomers(page, limit) {
        return this.adminService.getAllCustomers(page ? Number(page) : 1, limit ? Number(limit) : 10);
    }
    getAllReviews(isApproved, page, limit) {
        return this.adminService.getAllReviews(page ? Number(page) : 1, limit ? Number(limit) : 10, isApproved ? isApproved === 'true' : undefined);
    }
    approveReview(id) {
        return this.adminService.approveReview(id);
    }
    deleteReview(id) {
        return this.adminService.deleteReview(id);
    }
    async getDeliverySettings() {
        return this.adminService.getDeliverySettings();
    }
    async updateDeliverySettings(dto) {
        await this.adminService.updateDeliverySettings(dto);
        return { ...dto, message: 'Delivery settings updated successfully' };
    }
    getAnnouncement() {
        return this.adminService.getAnnouncementBar();
    }
    updateAnnouncement(dto) {
        return this.adminService.updateAnnouncementBar(dto);
    }
    async getDiscountSettings() {
        const settings = await this.adminService.getDiscountSettings();
        return settings;
    }
    async updateDiscountSettings(dto) {
        return this.adminService.updateDiscountSettings(dto);
    }
    async getCategories() {
        return this.adminService.getAllCategories();
    }
    async initializeUsers() {
        try {
            const result = await this.adminService.seedInitialUsers();
            return {
                status: 'success',
                message: 'Initial users created successfully',
                data: result,
            };
        }
        catch (error) {
            console.error('Init users failed:', error);
            return {
                status: 'error',
                message: error?.message || 'Failed to initialize users',
            };
        }
    }
    async fixSuperAdmin() {
        try {
            const result = await this.adminService.fixSuperAdminRole();
            return {
                status: 'success',
                message: 'SuperAdmin role fixed',
                data: result,
            };
        }
        catch (error) {
            console.error('Init users failed:', error);
            return {
                status: 'error',
                message: error?.message || 'Failed to initialize users',
            };
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with pagination and optional role filter' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new user with role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserRoleDto, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new product' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('products/with-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Create product with image upload' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProductWithImages", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Put)('products/:id/with-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product with image upload' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProductWithImages", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reviews' }),
    __param(0, (0, common_1.Query)('isApproved')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveReview", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Get)('settings/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDeliverySettings", null);
__decorate([
    (0, common_1.Put)('settings/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.UpdateDeliverySettingsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateDeliverySettings", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('settings/announcement'),
    (0, swagger_1.ApiOperation)({ summary: 'Get announcement bar settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAnnouncement", null);
__decorate([
    (0, common_1.Put)('settings/announcement'),
    (0, swagger_1.ApiOperation)({ summary: 'Update announcement bar' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_dto_1.UpdateAnnouncementDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateAnnouncement", null);
__decorate([
    (0, common_1.Get)('settings/discount'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discount settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDiscountSettings", null);
__decorate([
    (0, common_1.Put)('settings/discount'),
    (0, swagger_1.ApiOperation)({ summary: 'Update discount settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.UpdateDiscountSettingsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateDiscountSettings", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories for product creation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('init'),
    (0, public_decorator_1.Public)(),
    (0, common_2.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default users (Super Admin, Admin, Vendor, User)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "initializeUsers", null);
__decorate([
    (0, common_1.Post)('fix-superadmin'),
    (0, public_decorator_1.Public)(),
    (0, common_2.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Fix SuperAdmin role (temporary endpoint)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fixSuperAdmin", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        upload_service_1.UploadService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map