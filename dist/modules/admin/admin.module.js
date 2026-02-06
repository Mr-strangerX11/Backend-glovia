"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const vendor_controller_1 = require("./vendor.controller");
const user_schema_1 = require("../../database/schemas/user.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const order_schema_1 = require("../../database/schemas/order.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
const review_schema_1 = require("../../database/schemas/review.schema");
const category_schema_1 = require("../../database/schemas/category.schema");
const brand_schema_1 = require("../../database/schemas/brand.schema");
const product_image_schema_1 = require("../../database/schemas/product-image.schema");
const setting_schema_1 = require("../../database/schemas/setting.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: order_item_schema_1.OrderItem.name, schema: order_item_schema_1.OrderItemSchema },
                { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: brand_schema_1.Brand.name, schema: brand_schema_1.BrandSchema },
                { name: product_image_schema_1.ProductImage.name, schema: product_image_schema_1.ProductImageSchema },
                { name: setting_schema_1.Setting.name, schema: setting_schema_1.SettingSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController, vendor_controller_1.VendorController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map