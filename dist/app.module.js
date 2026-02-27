"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const auditlog_module_1 = require("./modules/auditlog/auditlog.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./database/prisma.module");
const firebase_module_1 = require("./common/modules/firebase.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const products_module_1 = require("./modules/products/products.module");
const categories_module_1 = require("./modules/categories/categories.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const admin_module_1 = require("./modules/admin/admin.module");
const health_module_1 = require("./modules/health/health.module");
const cart_module_1 = require("./modules/cart/cart.module");
const wishlist_module_1 = require("./modules/wishlist/wishlist.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const banners_module_1 = require("./modules/banners/banners.module");
const blogs_module_1 = require("./modules/blogs/blogs.module");
const upload_module_1 = require("./modules/upload/upload.module");
const verification_module_1 = require("./modules/verification/verification.module");
const brands_module_1 = require("./modules/brands/brands.module");
const promocodes_module_1 = require("./modules/promocodes/promocodes.module");
const popups_module_1 = require("./modules/popups/popups.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const ai_module_1 = require("./modules/ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            prisma_module_1.DatabaseModule,
            firebase_module_1.FirebaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            brands_module_1.BrandsModule,
            orders_module_1.OrdersModule,
            promocodes_module_1.PromoCodesModule,
            popups_module_1.PopupsModule,
            auditlog_module_1.AuditLogModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            cart_module_1.CartModule,
            wishlist_module_1.WishlistModule,
            reviews_module_1.ReviewsModule,
            banners_module_1.BannersModule,
            blogs_module_1.BlogsModule,
            upload_module_1.UploadModule,
            verification_module_1.VerificationModule,
            health_module_1.HealthModule,
            analytics_module_1.AnalyticsModule,
            ai_module_1.AiModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map