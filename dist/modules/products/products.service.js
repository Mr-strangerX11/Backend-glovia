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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ProductsService = class ProductsService {
    constructor(productModel, productImageModel, categoryModel, brandModel, reviewModel) {
        this.productModel = productModel;
        this.productImageModel = productImageModel;
        this.categoryModel = categoryModel;
        this.brandModel = brandModel;
        this.reviewModel = reviewModel;
    }
    async findAll(filters) {
        const { search, categoryId, category, brandId, brand, skinType, minPrice, maxPrice, isFeatured, isBestSeller, isNew, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = filters || {};
        const where = {
            isActive: true,
        };
        if (search) {
            const regex = new RegExp(search, 'i');
            where.$or = [
                { name: regex },
                { description: regex },
                { tags: search },
            ];
        }
        let resolvedCategoryId;
        if (categoryId && mongoose_2.Types.ObjectId.isValid(categoryId)) {
            resolvedCategoryId = new mongoose_2.Types.ObjectId(categoryId);
        }
        else if (category) {
            const categoryRecord = await this.categoryModel
                .findOne({ slug: category, isActive: true })
                .select('_id')
                .lean();
            if (categoryRecord?._id) {
                resolvedCategoryId = new mongoose_2.Types.ObjectId(categoryRecord._id);
            }
        }
        if (resolvedCategoryId) {
            where.categoryId = resolvedCategoryId;
        }
        let resolvedBrandId;
        if (brandId && mongoose_2.Types.ObjectId.isValid(brandId)) {
            resolvedBrandId = new mongoose_2.Types.ObjectId(brandId);
        }
        else if (brand) {
            const brandRecord = await this.brandModel
                .findOne({ slug: brand })
                .select('_id')
                .lean();
            if (brandRecord?._id) {
                resolvedBrandId = new mongoose_2.Types.ObjectId(brandRecord._id);
            }
        }
        if (resolvedBrandId) {
            where.brandId = resolvedBrandId;
        }
        if (skinType) {
            where.suitableFor = skinType;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter = {};
            if (minPrice !== undefined) {
                priceFilter.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                priceFilter.$lte = maxPrice;
            }
            where.price = priceFilter;
        }
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
        if (isBestSeller !== undefined) {
            where.isBestSeller = isBestSeller;
        }
        if (isNew !== undefined) {
            where.isNewProduct = isNew;
        }
        const skip = (page - 1) * limit;
        const sortValue = sortOrder === 'asc' ? 1 : -1;
        const [products, total] = await Promise.all([
            this.productModel
                .find(where)
                .sort({ [sortBy]: sortValue })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.productModel.countDocuments(where),
        ]);
        const productIds = products.map((product) => product._id);
        const [images, categories, brands, reviewStats] = await Promise.all([
            this.productImageModel
                .find({ productId: { $in: productIds } })
                .sort({ displayOrder: 1 })
                .lean(),
            this.categoryModel
                .find({ _id: { $in: products.map((p) => p.categoryId) } })
                .select('_id name slug')
                .lean(),
            this.brandModel
                .find({ _id: { $in: products.map((p) => p.brandId).filter(Boolean) } })
                .select('_id name slug')
                .lean(),
            this.reviewModel
                .aggregate([
                {
                    $match: {
                        productId: { $in: productIds },
                    },
                },
                {
                    $group: {
                        _id: '$productId',
                        averageRating: { $avg: '$rating' },
                        reviewCount: { $sum: 1 },
                    },
                },
            ]),
        ]);
        const firstImageByProductId = images.reduce((acc, image) => {
            const key = image.productId.toString();
            if (!acc[key]) {
                acc[key] = image;
            }
            return acc;
        }, {});
        const categoryById = categories.reduce((acc, category) => {
            acc[category._id.toString()] = category;
            return acc;
        }, {});
        const brandById = brands.reduce((acc, brand) => {
            acc[brand._id.toString()] = brand;
            return acc;
        }, {});
        const reviewStatsByProductId = reviewStats.reduce((acc, stat) => {
            acc[stat._id.toString()] = stat;
            return acc;
        }, {});
        const productsWithRatings = products.map((product) => {
            const stats = reviewStatsByProductId[product._id.toString()];
            const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
            const reviewCount = stats ? stats.reviewCount : 0;
            return {
                ...product,
                images: firstImageByProductId[product._id.toString()] ? [firstImageByProductId[product._id.toString()]] : [],
                category: categoryById[product.categoryId?.toString()],
                brand: product.brandId ? brandById[product.brandId.toString()] : null,
                averageRating,
                reviewCount,
            };
        });
        return {
            data: productsWithRatings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findBySlug(slug) {
        const product = await this.productModel
            .findOne({ slug, isActive: true })
            .lean();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const [images, category, brand, reviews] = await Promise.all([
            this.productImageModel
                .find({ productId: product._id })
                .sort({ displayOrder: 1 })
                .lean(),
            this.categoryModel
                .findById(product.categoryId)
                .select('_id name slug')
                .lean(),
            product.brandId
                ? this.brandModel
                    .findById(product.brandId)
                    .select('_id name slug logo')
                    .lean()
                : null,
            this.reviewModel
                .find({ productId: product._id, isApproved: true })
                .sort({ createdAt: -1 })
                .populate({
                path: 'userId',
                model: 'User',
                select: 'firstName lastName profileImage',
            })
                .lean(),
        ]);
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        return {
            ...product,
            images,
            category,
            brand,
            reviews: reviews.map((review) => ({
                ...review,
                user: review.userId,
            })),
            averageRating: Number(avgRating.toFixed(1)),
            reviewCount: reviews.length,
        };
    }
    async getFeaturedProducts(limit = 8) {
        const products = await this.productModel
            .find({ isActive: true, isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const productIds = products.map((product) => product._id);
        const [images, categories] = await Promise.all([
            this.productImageModel
                .find({ productId: { $in: productIds } })
                .sort({ displayOrder: 1 })
                .lean(),
            this.categoryModel
                .find({ _id: { $in: products.map((p) => p.categoryId) } })
                .select('_id name')
                .lean(),
        ]);
        const firstImageByProductId = images.reduce((acc, image) => {
            const key = image.productId.toString();
            if (!acc[key]) {
                acc[key] = image;
            }
            return acc;
        }, {});
        const categoryById = categories.reduce((acc, category) => {
            acc[category._id.toString()] = category;
            return acc;
        }, {});
        return products.map((product) => ({
            ...product,
            images: firstImageByProductId[product._id.toString()] ? [firstImageByProductId[product._id.toString()]] : [],
            category: categoryById[product.categoryId?.toString()],
        }));
    }
    async getBestSellers(limit = 8) {
        const products = await this.productModel
            .find({ isActive: true, isBestSeller: true })
            .limit(limit)
            .lean();
        const productIds = products.map((product) => product._id);
        const images = await this.productImageModel
            .find({ productId: { $in: productIds } })
            .sort({ displayOrder: 1 })
            .lean();
        const firstImageByProductId = images.reduce((acc, image) => {
            const key = image.productId.toString();
            if (!acc[key]) {
                acc[key] = image;
            }
            return acc;
        }, {});
        return products.map((product) => ({
            ...product,
            images: firstImageByProductId[product._id.toString()] ? [firstImageByProductId[product._id.toString()]] : [],
        }));
    }
    async getRelatedProducts(productId, categoryId, limit = 4) {
        const products = await this.productModel
            .find({
            _id: { $ne: new mongoose_2.Types.ObjectId(productId) },
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
            isActive: true,
        })
            .limit(limit)
            .lean();
        const productIds = products.map((product) => product._id);
        const images = await this.productImageModel
            .find({ productId: { $in: productIds } })
            .sort({ displayOrder: 1 })
            .lean();
        const firstImageByProductId = images.reduce((acc, image) => {
            const key = image.productId.toString();
            if (!acc[key]) {
                acc[key] = image;
            }
            return acc;
        }, {});
        return products.map((product) => ({
            ...product,
            images: firstImageByProductId[product._id.toString()] ? [firstImageByProductId[product._id.toString()]] : [],
        }));
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Product')),
    __param(1, (0, mongoose_1.InjectModel)('ProductImage')),
    __param(2, (0, mongoose_1.InjectModel)('Category')),
    __param(3, (0, mongoose_1.InjectModel)('Brand')),
    __param(4, (0, mongoose_1.InjectModel)('Review')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map