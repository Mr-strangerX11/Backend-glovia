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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("../../database/schemas/review.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
const order_schema_1 = require("../../database/schemas/order.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let ReviewsService = class ReviewsService {
    constructor(reviewModel, productModel, orderItemModel, orderModel, userModel) {
        this.reviewModel = reviewModel;
        this.productModel = productModel;
        this.orderItemModel = orderItemModel;
        this.orderModel = orderModel;
        this.userModel = userModel;
    }
    async create(userId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(dto.productId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.productModel.findById(dto.productId).lean();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const orderItems = await this.orderItemModel.find({
            productId: new mongoose_2.Types.ObjectId(dto.productId)
        }).lean();
        const orderIds = orderItems.map(item => item.orderId);
        const hasPurchased = await this.orderModel.findOne({
            _id: { $in: orderIds },
            userId: new mongoose_2.Types.ObjectId(userId),
            status: order_schema_1.OrderStatus.DELIVERED
        }).lean();
        const existingReview = await this.reviewModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            productId: new mongoose_2.Types.ObjectId(dto.productId)
        }).lean();
        if (existingReview) {
            throw new common_1.BadRequestException('You have already reviewed this product');
        }
        const review = new this.reviewModel({
            ...dto,
            userId: new mongoose_2.Types.ObjectId(userId),
            productId: new mongoose_2.Types.ObjectId(dto.productId),
            isVerified: !!hasPurchased,
            isApproved: false
        });
        const savedReview = await review.save();
        const user = await this.userModel.findById(userId).select('firstName lastName profileImage').lean();
        return {
            ...savedReview.toObject(),
            approved: savedReview.isApproved,
            user
        };
    }
    async findByProduct(productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const reviews = await this.reviewModel.find({
            productId: new mongoose_2.Types.ObjectId(productId),
            isApproved: true
        }).sort({ createdAt: -1 }).lean();
        const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
        const users = await this.userModel.find({
            _id: { $in: userIds }
        }).select('firstName lastName profileImage').lean();
        const userMap = users.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});
        return reviews.map(review => ({
            ...review,
            approved: review.isApproved,
            user: userMap[review.userId.toString()] || null
        }));
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_item_schema_1.OrderItem.name)),
    __param(3, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map