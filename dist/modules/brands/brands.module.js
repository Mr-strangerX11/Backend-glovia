"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const brands_service_1 = require("./brands.service");
const brands_controller_1 = require("./brands.controller");
const schemas_1 = require("../../database/schemas");
const auditlog_module_1 = require("../auditlog/auditlog.module");
let BrandsModule = class BrandsModule {
};
exports.BrandsModule = BrandsModule;
exports.BrandsModule = BrandsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auditlog_module_1.AuditLogModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'Brand', schema: schemas_1.BrandSchema },
                { name: 'Product', schema: schemas_1.ProductSchema },
                { name: 'ProductImage', schema: schemas_1.ProductImageSchema },
                { name: 'OrderItem', schema: schemas_1.OrderItemSchema },
            ]),
        ],
        controllers: [brands_controller_1.BrandsController],
        providers: [brands_service_1.BrandsService],
        exports: [brands_service_1.BrandsService],
    })
], BrandsModule);
//# sourceMappingURL=brands.module.js.map