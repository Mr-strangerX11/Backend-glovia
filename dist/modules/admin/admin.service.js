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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("../../database/schemas/user.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const order_schema_1 = require("../../database/schemas/order.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
const review_schema_1 = require("../../database/schemas/review.schema");
const category_schema_1 = require("../../database/schemas/category.schema");
const brand_schema_1 = require("../../database/schemas/brand.schema");
const product_image_schema_1 = require("../../database/schemas/product-image.schema");
const setting_schema_1 = require("../../database/schemas/setting.schema");
let AdminService = class AdminService {
    constructor(userModel, productModel, orderModel, orderItemModel, reviewModel, categoryModel, brandModel, productImageModel, settingModel) {
        this.userModel = userModel;
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.orderItemModel = orderItemModel;
        this.reviewModel = reviewModel;
        this.categoryModel = categoryModel;
        this.brandModel = brandModel;
        this.productImageModel = productImageModel;
        this.settingModel = settingModel;
    }
    async getDashboard() {
        const totalOrders = await this.orderModel.countDocuments();
        const totalRevenue = await this.orderModel.aggregate([
            {
                $group: {
                    _id: null,
                    sum: { $sum: '$total' }
                }
            }
        ]);
        const totalCustomers = await this.userModel.countDocuments({ role: user_schema_1.UserRole.CUSTOMER });
        const totalProducts = await this.productModel.countDocuments();
        const recentOrders = await this.orderModel
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        const userIds = [...new Set(recentOrders.map(o => o.userId.toString()))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
        const userMap = users.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});
        const recentOrdersWithUsers = recentOrders.map(order => ({
            ...order,
            user: userMap[order.userId.toString()] || null
        }));
        const topProducts = await this.orderItemModel.aggregate([
            {
                $group: {
                    _id: '$productId',
                    totalSold: { $sum: '$quantity' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);
        const productIds = topProducts.map(p => p._id);
        const products = await this.productModel.find({ _id: { $in: productIds } }).lean();
        const productMap = products.reduce((acc, p) => {
            acc[p._id.toString()] = p;
            return acc;
        }, {});
        const topProductsWithDetails = topProducts.map(item => ({
            product: productMap[item._id.toString()] || null,
            totalSold: item.totalSold
        }));
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const revenueByMonth = await this.orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.sum || 0,
            totalCustomers,
            totalProducts,
            recentOrders: recentOrdersWithUsers,
            topProducts: topProductsWithDetails,
            revenueByMonth
        };
    }
    async createUser(createUserDto) {
        const existingUser = await this.userModel.findOne({ email: createUserDto.email }).lean();
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.userModel.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return user.toObject();
    }
    async getAllUsers(page = 1, limit = 10, role) {
        const skip = (page - 1) * limit;
        const filter = role ? { role } : {};
        const [users, total] = await Promise.all([
            this.userModel.find(filter).skip(skip).limit(limit).lean(),
            this.userModel.countDocuments(filter)
        ]);
        const usersWithId = users.map((user) => ({
            ...user,
            id: user._id.toString()
        }));
        return {
            data: usersWithId,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async updateUserRole(userId, role, adminRole) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (role === user_schema_1.UserRole.SUPER_ADMIN || user.role === user_schema_1.UserRole.SUPER_ADMIN) {
            if (adminRole !== user_schema_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can modify SUPER_ADMIN roles');
            }
        }
        return this.userModel.findByIdAndUpdate(userId, { role }, { new: true }).lean();
    }
    async deleteUser(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userModel.findByIdAndDelete(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getAllProducts(page = 1, limit = 10, categoryId, brandId) {
        const skip = (page - 1) * limit;
        const filter = {};
        if (categoryId && mongoose_2.Types.ObjectId.isValid(categoryId)) {
            filter.categoryId = new mongoose_2.Types.ObjectId(categoryId);
        }
        if (brandId && mongoose_2.Types.ObjectId.isValid(brandId)) {
            filter.brandId = new mongoose_2.Types.ObjectId(brandId);
        }
        const [products, total] = await Promise.all([
            this.productModel.find(filter).skip(skip).limit(limit).lean(),
            this.productModel.countDocuments(filter)
        ]);
        const productIds = products.map(p => p._id);
        const categoryIds = [...new Set(products.map(p => p.categoryId?.toString()).filter(Boolean))];
        const brandIds = [...new Set(products.map(p => p.brandId?.toString()).filter(Boolean))];
        const [images, categories, brands] = await Promise.all([
            this.productImageModel.find({ productId: { $in: productIds } }).lean(),
            this.categoryModel.find({ _id: { $in: categoryIds } }).lean(),
            this.brandModel.find({ _id: { $in: brandIds } }).lean()
        ]);
        const imagesByProduct = images.reduce((acc, img) => {
            const key = img.productId.toString();
            if (!acc[key])
                acc[key] = [];
            acc[key].push(img);
            return acc;
        }, {});
        const categoryMap = categories.reduce((acc, c) => {
            acc[c._id.toString()] = c;
            return acc;
        }, {});
        const brandMap = brands.reduce((acc, b) => {
            acc[b._id.toString()] = b;
            return acc;
        }, {});
        const productsWithRelations = products.map(product => ({
            ...product,
            images: imagesByProduct[product._id.toString()] || [],
            category: product.categoryId ? categoryMap[product.categoryId.toString()] || null : null,
            brand: product.brandId ? brandMap[product.brandId.toString()] || null : null
        }));
        return {
            data: productsWithRelations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getProduct(productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.productModel.findById(productId).lean();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const [images, category, brand] = await Promise.all([
            this.productImageModel.find({ productId: new mongoose_2.Types.ObjectId(productId) }).lean(),
            product.categoryId ? this.categoryModel.findById(product.categoryId).lean() : null,
            product.brandId ? this.brandModel.findById(product.brandId).lean() : null
        ]);
        return {
            ...product,
            images,
            category,
            brand
        };
    }
    async createProduct(createProductDto) {
        const { images, categoryId, brandId, ...productData } = createProductDto;
        if (!mongoose_2.Types.ObjectId.isValid(categoryId)) {
            throw new common_1.BadRequestException('Invalid category ID');
        }
        const category = await this.categoryModel.findById(categoryId).lean();
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (brandId) {
            if (!mongoose_2.Types.ObjectId.isValid(brandId)) {
                throw new common_1.BadRequestException('Invalid brand ID');
            }
            const brand = await this.brandModel.findById(brandId).lean();
            if (!brand) {
                throw new common_1.NotFoundException('Brand not found');
            }
        }
        const product = new this.productModel({
            ...productData,
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
            brandId: brandId ? new mongoose_2.Types.ObjectId(brandId) : null
        });
        const savedProduct = await product.save();
        if (images && Array.isArray(images) && images.length > 0) {
            const imageDocuments = images.map((url, index) => ({
                productId: savedProduct._id,
                url,
                isPrimary: index === 0,
                altText: null
            }));
            await this.productImageModel.insertMany(imageDocuments);
        }
        return savedProduct;
    }
    async updateProduct(productId, updateProductDto) {
        if (!mongoose_2.Types.ObjectId.isValid(productId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.productModel.findById(productId).lean();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const { images, ...productData } = updateProductDto;
        const updatedProduct = await this.productModel.findByIdAndUpdate(productId, productData, { new: true }).lean();
        if (images && Array.isArray(images)) {
            await this.productImageModel.deleteMany({ productId: new mongoose_2.Types.ObjectId(productId) });
            const newImages = images.map((img) => ({
                productId: new mongoose_2.Types.ObjectId(productId),
                url: img.url,
                altText: img.altText || null,
                isPrimary: img.isPrimary || false
            }));
            await this.productImageModel.insertMany(newImages);
        }
        return updatedProduct;
    }
    async deleteProduct(productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.productModel.findByIdAndDelete(productId).lean();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.productImageModel.deleteMany({ productId: new mongoose_2.Types.ObjectId(productId) });
        return product;
    }
    async getAllOrders(page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const filter = status ? { status } : {};
        const [orders, total] = await Promise.all([
            this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.orderModel.countDocuments(filter)
        ]);
        const userIds = [...new Set(orders.map(o => o.userId.toString()))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
        const userMap = users.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});
        const orderIds = orders.map(o => o._id);
        const orderItems = await this.orderItemModel.find({ orderId: { $in: orderIds } }).lean();
        const itemsByOrder = orderItems.reduce((acc, item) => {
            const key = item.orderId.toString();
            if (!acc[key])
                acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        const ordersWithRelations = orders.map(order => ({
            ...order,
            user: userMap[order.userId.toString()] || null,
            items: itemsByOrder[order._id.toString()] || []
        }));
        return {
            data: ordersWithRelations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async updateOrderStatus(orderId, status) {
        if (!mongoose_2.Types.ObjectId.isValid(orderId)) {
            throw new common_1.BadRequestException('Invalid order ID');
        }
        const order = await this.orderModel.findById(orderId).lean();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const updateData = { status };
        if (status === order_schema_1.OrderStatus.CONFIRMED) {
            updateData.confirmedAt = new Date();
        }
        else if (status === order_schema_1.OrderStatus.SHIPPED) {
            updateData.shippedAt = new Date();
        }
        else if (status === order_schema_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        else if (status === order_schema_1.OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }
        return this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true }).lean();
    }
    async getAllCustomers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            this.userModel.find({ role: user_schema_1.UserRole.CUSTOMER }).skip(skip).limit(limit).lean(),
            this.userModel.countDocuments({ role: user_schema_1.UserRole.CUSTOMER })
        ]);
        const customerIds = customers.map(c => c._id);
        const orderCounts = await this.orderModel.aggregate([
            {
                $match: { userId: { $in: customerIds } }
            },
            {
                $group: {
                    _id: '$userId',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' }
                }
            }
        ]);
        const orderCountMap = orderCounts.reduce((acc, item) => {
            acc[item._id.toString()] = {
                orderCount: item.orderCount,
                totalSpent: item.totalSpent
            };
            return acc;
        }, {});
        const customersWithStats = customers.map(customer => ({
            ...customer,
            id: customer._id.toString(),
            orderCount: orderCountMap[customer._id.toString()]?.orderCount || 0,
            totalSpent: orderCountMap[customer._id.toString()]?.totalSpent || 0
        }));
        return {
            data: customersWithStats,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getAllReviews(page = 1, limit = 10, approved) {
        const skip = (page - 1) * limit;
        const filter = approved !== undefined ? { approved } : {};
        const [reviews, total] = await Promise.all([
            this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.reviewModel.countDocuments(filter)
        ]);
        const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
        const productIds = [...new Set(reviews.map(r => r.productId.toString()))];
        const [users, products] = await Promise.all([
            this.userModel.find({ _id: { $in: userIds } }).lean(),
            this.productModel.find({ _id: { $in: productIds } }).lean()
        ]);
        const userMap = users.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});
        const productMap = products.reduce((acc, p) => {
            acc[p._id.toString()] = p;
            return acc;
        }, {});
        const reviewsWithRelations = reviews.map(review => ({
            ...review,
            user: userMap[review.userId.toString()] || null,
            product: productMap[review.productId.toString()] || null
        }));
        return {
            data: reviewsWithRelations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async approveReview(reviewId) {
        if (!mongoose_2.Types.ObjectId.isValid(reviewId)) {
            throw new common_1.BadRequestException('Invalid review ID');
        }
        const review = await this.reviewModel.findByIdAndUpdate(reviewId, { approved: true }, { new: true }).lean();
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async deleteReview(reviewId) {
        if (!mongoose_2.Types.ObjectId.isValid(reviewId)) {
            throw new common_1.BadRequestException('Invalid review ID');
        }
        const review = await this.reviewModel.findByIdAndDelete(reviewId).lean();
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async updateDeliveryCharge(charge) {
        return this.settingModel.findOneAndUpdate({ key: 'deliveryCharge' }, {
            key: 'deliveryCharge',
            value: charge.toString()
        }, { upsert: true, new: true }).lean();
    }
    async getDeliveryCharge() {
        const setting = await this.settingModel.findOne({ key: 'deliveryCharge' }).lean();
        return setting ? parseFloat(setting.value) : 0;
    }
    async updateAnnouncementBar(data) {
        const updateValue = JSON.stringify({
            enabled: data.enabled,
            message: data.message || '',
            backgroundColor: data.backgroundColor || '#000000',
            textColor: data.textColor || '#ffffff'
        });
        return this.settingModel.findOneAndUpdate({ key: 'announcementBar' }, {
            key: 'announcementBar',
            value: updateValue
        }, { upsert: true, new: true }).lean();
    }
    async getAnnouncementBar() {
        const setting = await this.settingModel.findOne({ key: 'announcementBar' }).lean();
        if (!setting) {
            return {
                enabled: false,
                message: '',
                backgroundColor: '#000000',
                textColor: '#ffffff'
            };
        }
        return JSON.parse(setting.value);
    }
    async updateDiscountSettings(data) {
        const updateValue = JSON.stringify({
            enabled: data.enabled,
            percentage: data.percentage || 0,
            minOrderAmount: data.minOrderAmount || 0
        });
        return this.settingModel.findOneAndUpdate({ key: 'discountSettings' }, {
            key: 'discountSettings',
            value: updateValue
        }, { upsert: true, new: true }).lean();
    }
    async getDiscountSettings() {
        const setting = await this.settingModel.findOne({ key: 'discountSettings' }).lean();
        if (!setting) {
            return {
                enabled: false,
                percentage: 0,
                minOrderAmount: 0
            };
        }
        try {
            return JSON.parse(setting.value);
        }
        catch (e) {
            return {
                enabled: false,
                percentage: 0,
                minOrderAmount: 0
            };
        }
    }
    async getAllCategories() {
        try {
            const categories = await this.categoryModel
                .find({ isActive: true })
                .sort({ displayOrder: 1 })
                .lean();
            if (!categories || categories.length === 0) {
                throw new common_1.NotFoundException('No categories found. Please seed categories first using POST /categories/seed');
            }
            return {
                data: categories,
                count: categories.length,
                message: 'Categories retrieved successfully'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve categories');
        }
    }
    async seedInitialUsers() {
        const users = [
            {
                email: 'superadmin@glovia.com.np',
                password: 'SuperAdmin123!',
                firstName: 'Super',
                lastName: 'Admin',
                phone: '+977-9800000001',
                role: user_schema_1.UserRole.SUPER_ADMIN,
                isEmailVerified: true,
                trustScore: 100,
            },
            {
                email: 'admin@glovia.com.np',
                password: 'Admin123!',
                firstName: 'Admin',
                lastName: 'User',
                phone: '+977-9800000002',
                role: user_schema_1.UserRole.ADMIN,
                isEmailVerified: true,
                trustScore: 100,
            },
            {
                email: 'vendor@glovia.com.np',
                password: 'Vendor123!',
                firstName: 'Vendor',
                lastName: 'Account',
                phone: '+977-9800000003',
                role: user_schema_1.UserRole.VENDOR,
                isEmailVerified: true,
                trustScore: 75,
            },
            {
                email: 'user@glovia.com.np',
                password: 'User123!',
                firstName: 'Regular',
                lastName: 'User',
                phone: '+977-9800000004',
                role: user_schema_1.UserRole.CUSTOMER,
                isEmailVerified: true,
                trustScore: 50,
            },
        ];
        const createdUsers = [];
        for (const userData of users) {
            const existingUser = await this.userModel.findOne({ email: userData.email });
            if (existingUser) {
                if (existingUser.role !== userData.role && userData.role === user_schema_1.UserRole.SUPER_ADMIN) {
                    await this.userModel.findByIdAndUpdate(existingUser._id, { role: userData.role });
                    createdUsers.push({
                        email: userData.email,
                        status: 'role_updated_to_SUPER_ADMIN',
                    });
                }
                else {
                    createdUsers.push({
                        email: userData.email,
                        status: 'already_exists',
                    });
                }
                continue;
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.userModel.create({
                ...userData,
                password: hashedPassword,
            });
            createdUsers.push({
                email: userData.email,
                password: userData.password,
                role: userData.role,
                status: 'created',
            });
        }
        return createdUsers;
    }
    async fixSuperAdminRole() {
        const superadmin = await this.userModel.findOne({ email: 'superadmin@glovia.com.np' });
        if (!superadmin) {
            throw new common_1.NotFoundException('SuperAdmin user not found');
        }
        if (superadmin.role === user_schema_1.UserRole.SUPER_ADMIN) {
            return { email: superadmin.email, role: superadmin.role, status: 'already_correct' };
        }
        await this.userModel.findByIdAndUpdate(superadmin._id, { role: user_schema_1.UserRole.SUPER_ADMIN });
        return { email: superadmin.email, oldRole: superadmin.role, newRole: user_schema_1.UserRole.SUPER_ADMIN, status: 'updated' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(3, (0, mongoose_1.InjectModel)(order_item_schema_1.OrderItem.name)),
    __param(4, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(5, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(6, (0, mongoose_1.InjectModel)(brand_schema_1.Brand.name)),
    __param(7, (0, mongoose_1.InjectModel)(product_image_schema_1.ProductImage.name)),
    __param(8, (0, mongoose_1.InjectModel)(setting_schema_1.Setting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map