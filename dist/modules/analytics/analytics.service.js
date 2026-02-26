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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../database/schemas/order.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
let AnalyticsService = class AnalyticsService {
    constructor(orderModel, userModel, productModel, orderItemModel) {
        this.orderModel = orderModel;
        this.userModel = userModel;
        this.productModel = productModel;
        this.orderItemModel = orderItemModel;
    }
    async getOverview() {
        const [totalOrders, totalRevenue, totalCustomers, totalProducts] = await Promise.all([
            this.orderModel.countDocuments(),
            this.orderModel.aggregate([{ $group: { _id: null, sum: { $sum: '$total' } } }]),
            this.userModel.countDocuments({ role: user_schema_1.UserRole.CUSTOMER }),
            this.productModel.countDocuments(),
        ]);
        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.sum || 0,
            totalCustomers,
            totalProducts,
        };
    }
    async getSales(query) {
        const days = Number(query.days) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const sales = await this.orderModel.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        return sales;
    }
    async getRevenue(query) {
        const days = Number(query.days) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const revenue = await this.orderModel.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sum: { $sum: '$total' } } },
            { $sort: { _id: 1 } },
        ]);
        return revenue;
    }
    async getTopProducts(query) {
        const limit = Number(query.limit) || 5;
        const topProducts = await this.orderItemModel.aggregate([
            { $group: { _id: '$productId', totalSold: { $sum: '$quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: limit },
        ]);
        return topProducts;
    }
    async getTopCustomers(query) {
        const limit = Number(query.limit) || 5;
        const topCustomers = await this.orderModel.aggregate([
            { $group: { _id: '$userId', totalSpent: { $sum: '$total' }, orders: { $sum: 1 } } },
            { $sort: { totalSpent: -1 } },
            { $limit: limit },
        ]);
        return topCustomers;
    }
    async getOrdersStats(query) {
        const stats = await this.orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        return stats;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(3, (0, mongoose_1.InjectModel)(order_item_schema_1.OrderItem.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map