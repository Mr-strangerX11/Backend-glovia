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
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_schema_1 = require("../../database/schemas/user.schema");
const product_dto_1 = require("./dto/product.dto");
const user_dto_1 = require("./dto/user.dto");
const order_dto_1 = require("./dto/order.dto");
const settings_dto_1 = require("./dto/settings.dto");
const announcement_dto_1 = require("./dto/announcement.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboard() {
        return this.adminService.getDashboard();
    }
    createUser(dto) {
        return this.adminService.createUser(dto);
    }
    updateUserRole(id, role, actorRole) {
        return this.adminService.updateUserRole(id, role, actorRole);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    createProduct(dto) {
        return this.adminService.createProduct(dto);
    }
    updateProduct(id, dto) {
        return this.adminService.updateProduct(id, dto);
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
    getDeliverySettings() {
        return this.adminService.getDeliveryCharge();
    }
    updateDeliverySettings(dto) {
        return this.adminService.updateDeliveryCharge(dto.charge);
    }
    getAnnouncement() {
        return this.adminService.getAnnouncementBar();
    }
    updateAnnouncement(dto) {
        return this.adminService.updateAnnouncementBar(dto);
    }
    async initializeUsers() {
        const result = await this.adminService.seedInitialUsers();
        return {
            status: 'success',
            message: 'Initial users created successfully',
            data: result,
        };
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
    __param(1, (0, common_1.Body)('role')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
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
    (0, common_1.Put)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery charge' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDeliverySettings", null);
__decorate([
    (0, common_1.Put)('settings/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery charge' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.UpdateDeliverySettingsDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateDeliverySettings", null);
__decorate([
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
    (0, common_1.Post)('init'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default users (Super Admin, Admin, Vendor, User)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "initializeUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map