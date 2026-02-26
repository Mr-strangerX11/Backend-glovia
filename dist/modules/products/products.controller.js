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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
const auditlog_service_1 = require("../auditlog/auditlog.service");
let ProductsController = class ProductsController {
    constructor(productsService, auditLogService) {
        this.productsService = productsService;
        this.auditLogService = auditLogService;
    }
    getVariants(productId) {
        return this.productsService.getVariants(productId);
    }
    createVariant(productId, dto, req) {
        return this.productsService.createVariant(productId, dto, req.user);
    }
    updateVariant(productId, variantId, dto, req) {
        return this.productsService.updateVariant(productId, variantId, dto, req.user);
        deleteVariant(, productId, string, , variantId, string, , req, any);
        {
            const result = await this.productsService.deleteVariant(productId, variantId, req.user);
            const admin = req.user;
            await this.auditLogService.log('DELETE_PRODUCT_VARIANT', admin._id, admin.email, productId, { variantId });
            return result;
        }
        findAll(, query, any);
        {
            return this.productsService.findAll(query);
        }
        getFeatured(, limit ?  : string);
        {
            return this.productsService.getFeaturedProducts(limit ? Number(limit) : undefined);
        }
        getBestSellers(, limit ?  : string);
        {
            return this.productsService.getBestSellers(limit ? Number(limit) : undefined);
        }
        findBySlug(, slug, string);
        {
            return this.productsService.findBySlug(slug);
        }
        getRelated(, id, string, , categoryId, string, , limit ?  : string);
        {
            return this.productsService.getRelatedProducts(id, categoryId, limit ? Number(limit) : undefined);
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(':productId/variants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all variants for a product' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getVariants", null);
__decorate([
    (0, common_1.Post)(':productId/variants'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a variant for a product' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createVariant", null);
__decorate([
    (0, common_1.Put)(':productId/variants/:variantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a product variant' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Param)('variantId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateVariant", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        auditlog_service_1.AuditLogService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map