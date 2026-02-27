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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../../database/schemas/product.schema");
let RecommendationsService = class RecommendationsService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    async getRecommendations(userId, productId) {
        if (productId && mongoose_2.Types.ObjectId.isValid(productId)) {
            const product = await this.productModel.findById(productId).lean();
            if (product) {
                const similarProducts = await this.productModel
                    .find({
                    categoryId: product.categoryId,
                    _id: { $ne: product._id },
                    isActive: true,
                })
                    .limit(6)
                    .lean();
                if (similarProducts.length > 0) {
                    return similarProducts;
                }
            }
        }
        const popularProducts = await this.productModel
            .find({ isActive: true, isBestSeller: true })
            .limit(6)
            .lean();
        if (popularProducts.length > 0) {
            return popularProducts;
        }
        return this.productModel
            .find({ isActive: true })
            .limit(6)
            .lean();
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map