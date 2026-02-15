"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const payments_module_1 = require("../payments/payments.module");
const email_notification_module_1 = require("../../common/services/email-notification.module");
const trust_score_guard_1 = require("../../common/guards/trust-score.guard");
const order_schema_1 = require("../../database/schemas/order.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const address_schema_1 = require("../../database/schemas/address.schema");
const payment_schema_1 = require("../../database/schemas/payment.schema");
const cart_item_schema_1 = require("../../database/schemas/cart-item.schema");
const coupon_schema_1 = require("../../database/schemas/coupon.schema");
const product_image_schema_1 = require("../../database/schemas/product-image.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: order_item_schema_1.OrderItem.name, schema: order_item_schema_1.OrderItemSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: address_schema_1.Address.name, schema: address_schema_1.AddressSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: cart_item_schema_1.CartItem.name, schema: cart_item_schema_1.CartItemSchema },
                { name: coupon_schema_1.Coupon.name, schema: coupon_schema_1.CouponSchema },
                { name: product_image_schema_1.ProductImage.name, schema: product_image_schema_1.ProductImageSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            payments_module_1.PaymentsModule,
            email_notification_module_1.EmailNotificationModule
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService, trust_score_guard_1.TrustScoreGuard],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map