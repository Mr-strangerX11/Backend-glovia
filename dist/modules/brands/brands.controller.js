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
exports.BrandsController = void 0;
const common_1 = require("@nestjs/common");
const brands_service_1 = require("./brands.service");
const auditlog_service_1 = require("../auditlog/auditlog.service");
const brand_dto_1 = require("./dto/brand.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_schema_1 = require("../../database/schemas/user.schema");
let BrandsController = class BrandsController {
    constructor(brandsService, auditLogService) {
        this.brandsService = brandsService;
        this.auditLogService = auditLogService;
    }
    async getAllBrands() {
        return {
            success: true,
            data: await this.brandsService.getAllBrands(),
        };
    }
    async getBrandsList() {
        return {
            success: true,
            data: await this.brandsService.getBrandsList(),
        };
    }
    async getBrandBySlug(slug) {
        const brand = await this.brandsService.getBrandBySlug(slug);
        if (!brand) {
            return {
                success: false,
                message: 'Brand not found',
            };
        }
        return {
            success: true,
            data: brand,
        };
    }
    async createBrand(dto) {
        const brand = await this.brandsService.createBrand(dto);
        return {
            success: true,
            message: 'Brand created successfully',
            data: brand,
        };
    }
    async updateBrand(id, dto, req) {
        const brand = await this.brandsService.updateBrand(id, dto);
        const admin = req.user;
        await this.auditLogService.log('UPDATE_BRAND', admin._id, admin.email, id, { dto });
        return {
            success: true,
            message: 'Brand updated successfully',
            data: brand,
        };
    }
    async deleteBrand(id, req) {
        await this.brandsService.deleteBrand(id);
        const admin = req.user;
        await this.auditLogService.log('DELETE_BRAND', admin._id, admin.email, id, {});
        return {
            success: true,
            message: 'Brand deleted successfully',
        };
    }
    async getBrandAnalytics() {
        const analytics = await this.brandsService.getBrandAnalytics();
        return {
            success: true,
            data: analytics,
        };
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getAllBrands", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getBrandsList", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getBrandBySlug", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [brand_dto_1.CreateBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, brand_dto_1.UpdateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "updateBrand", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "deleteBrand", null);
__decorate([
    (0, common_1.Get)('admin/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getBrandAnalytics", null);
exports.BrandsController = BrandsController = __decorate([
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [brands_service_1.BrandsService,
        auditlog_service_1.AuditLogService])
], BrandsController);
//# sourceMappingURL=brands.controller.js.map