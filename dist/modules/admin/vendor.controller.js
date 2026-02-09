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
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_schema_1 = require("../../database/schemas/user.schema");
const admin_service_1 = require("./admin.service");
const product_dto_1 = require("./dto/product.dto");
const upload_service_1 = require("../upload/upload.service");
let VendorController = class VendorController {
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
    getProducts(search, page, limit) {
        return this.adminService.getAllProducts(page ? Number(page) : 1, limit ? Number(limit) : 10);
    }
    getProduct(id) {
        return this.adminService.getProduct(id);
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
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'List products (vendor view)' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by id (vendor)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create product (vendor)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('products/with-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Create product with image upload (vendor)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "createProductWithImages", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product (vendor)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Put)('products/:id/with-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product with image upload (vendor)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "updateProductWithImages", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product (vendor)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "deleteProduct", null);
exports.VendorController = VendorController = __decorate([
    (0, swagger_1.ApiTags)('Vendor'),
    (0, common_1.Controller)('vendor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.VENDOR, user_schema_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        upload_service_1.UploadService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map