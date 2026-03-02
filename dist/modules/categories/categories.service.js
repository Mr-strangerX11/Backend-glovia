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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schemas_1 = require("../../database/schemas");
let CategoriesService = class CategoriesService {
    constructor(categoryModel, productModel, productImageModel) {
        this.categoryModel = categoryModel;
        this.productModel = productModel;
        this.productImageModel = productImageModel;
    }
    async findAll() {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ displayOrder: 1 })
            .lean();
        const categoryIds = categories.map((category) => category._id);
        const [children, productCounts] = await Promise.all([
            this.categoryModel
                .find({
                parentId: { $in: categoryIds },
                isActive: true,
            })
                .sort({ displayOrder: 1 })
                .lean(),
            this.productModel
                .aggregate([
                {
                    $match: {
                        isActive: true,
                        categoryId: { $in: categoryIds },
                    },
                },
                {
                    $group: {
                        _id: '$categoryId',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);
        const childrenByParentId = children.reduce((acc, child) => {
            const key = child.parentId?.toString();
            if (!key) {
                return acc;
            }
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(child);
            return acc;
        }, {});
        const countsByCategoryId = productCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});
        return categories.map((category) => ({
            ...category,
            children: childrenByParentId[category._id.toString()] || [],
            _count: { products: countsByCategoryId[category._id.toString()] || 0 },
        }));
    }
    async findBySlug(slug) {
        const category = await this.categoryModel
            .findOne({ slug, isActive: true })
            .lean();
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const [children, products] = await Promise.all([
            this.categoryModel
                .find({ parentId: new mongoose_2.Types.ObjectId(category._id), isActive: true })
                .sort({ displayOrder: 1 })
                .lean(),
            this.productModel
                .find({ categoryId: new mongoose_2.Types.ObjectId(category._id), isActive: true })
                .limit(12)
                .lean(),
        ]);
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
        const productsWithImages = products.map((product) => ({
            ...product,
            images: firstImageByProductId[product._id.toString()]
                ? [firstImageByProductId[product._id.toString()]]
                : [],
        }));
        return {
            ...category,
            children,
            products: productsWithImages,
        };
    }
    async create(dto) {
        const payload = { ...dto };
        if (!payload.name || typeof payload.name !== 'string') {
            throw new common_1.BadRequestException('Category name is required');
        }
        const normalizedName = payload.name.trim();
        if (!normalizedName) {
            throw new common_1.BadRequestException('Category name is required');
        }
        payload.name = normalizedName;
        if (!payload.slug || typeof payload.slug !== 'string' || !payload.slug.trim()) {
            payload.slug = normalizedName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        else {
            payload.slug = payload.slug
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        let parentCategory = null;
        if (payload.parentId) {
            if (!mongoose_2.Types.ObjectId.isValid(payload.parentId)) {
                throw new common_1.BadRequestException('Invalid parentId');
            }
            parentCategory = await this.categoryModel.findById(payload.parentId);
            if (!parentCategory || !parentCategory.isActive) {
                throw new common_1.BadRequestException('Parent category not found');
            }
        }
        if (!payload.type && parentCategory?.type) {
            payload.type = parentCategory.type;
        }
        if (!payload.type) {
            throw new common_1.BadRequestException('Category type is required for main category');
        }
        const existingSlug = await this.categoryModel.findOne({ slug: payload.slug }).select('_id').lean();
        if (existingSlug) {
            const suffix = Date.now().toString().slice(-5);
            payload.slug = `${payload.slug}-${suffix}`;
        }
        const category = await this.categoryModel.create(payload);
        return category;
    }
    async update(id, dto) {
        const category = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async remove(id) {
        const category = await this.categoryModel.findByIdAndDelete(id);
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
    async seedInitialCategories() {
        const existingCount = await this.categoryModel.countDocuments();
        if (existingCount > 0) {
            return { message: 'Categories already exist', count: existingCount };
        }
        const categories = [
            {
                name: 'Skincare',
                slug: 'skincare',
                description: 'Skincare products for healthy and glowing skin',
                type: schemas_1.ProductCategory.SKINCARE,
                displayOrder: 1,
            },
            {
                name: 'Haircare',
                slug: 'haircare',
                description: 'Haircare products for beautiful and healthy hair',
                type: schemas_1.ProductCategory.HAIRCARE,
                displayOrder: 2,
            },
            {
                name: 'Makeup',
                slug: 'makeup',
                description: 'Makeup products for all your beauty needs',
                type: schemas_1.ProductCategory.MAKEUP,
                displayOrder: 3,
            },
            {
                name: 'Organic',
                slug: 'organic',
                description: 'Natural and organic beauty products',
                type: schemas_1.ProductCategory.ORGANIC,
                displayOrder: 4,
            },
            {
                name: 'Herbal',
                slug: 'herbal',
                description: 'Herbal beauty products with natural ingredients',
                type: schemas_1.ProductCategory.HERBAL,
                displayOrder: 5,
            },
        ];
        const created = await this.categoryModel.insertMany(categories);
        return { message: 'Categories seeded successfully', count: created.length, categories: created };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Category')),
    __param(1, (0, mongoose_1.InjectModel)('Product')),
    __param(2, (0, mongoose_1.InjectModel)('ProductImage')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map