import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../database/schemas/user.schema';
import { Product } from '../../database/schemas/product.schema';
import { Order, OrderStatus } from '../../database/schemas/order.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { Review } from '../../database/schemas/review.schema';
import { Category } from '../../database/schemas/category.schema';
import { Brand } from '../../database/schemas/brand.schema';
import { ProductImage } from '../../database/schemas/product-image.schema';
import { Setting } from '../../database/schemas/setting.schema';
import { CreateUserDto } from './dto/user.dto';
import { UpdateProductDto, CreateProductDto } from './dto/product.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(ProductImage.name) private productImageModel: Model<ProductImage>,
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}

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
    const totalCustomers = await this.userModel.countDocuments({ role: UserRole.CUSTOMER });
    const totalProducts = await this.productModel.countDocuments();

    // Recent orders with user info
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
    }, {} as Record<string, any>);

    const recentOrdersWithUsers = recentOrders.map(order => ({
      ...order,
      user: userMap[order.userId.toString()] || null
    }));

    // Top selling products
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
    }, {} as Record<string, any>);

    const topProductsWithDetails = topProducts.map(item => ({
      product: productMap[item._id.toString()] || null,
      totalSold: item.totalSold
    }));

    // Revenue by month (last 6 months)
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

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).lean();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async getAllUsers(page: number = 1, limit: number = 10, role?: UserRole) {
    const skip = (page - 1) * limit;
    const filter = role ? { role } : {};

    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter)
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserRole(userId: string, role: UserRole, adminRole: UserRole) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only SUPER_ADMIN can change roles to/from SUPER_ADMIN
    if (role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPER_ADMIN) {
      if (adminRole !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can modify SUPER_ADMIN roles');
      }
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).lean();
  }

  async deleteUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndDelete(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllProducts(page: number = 1, limit: number = 10, categoryId?: string, brandId?: string) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }
    if (brandId && Types.ObjectId.isValid(brandId)) {
      filter.brandId = new Types.ObjectId(brandId);
    }

    const [products, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter)
    ]);

    // Get images, categories, brands
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
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {} as Record<string, any[]>);

    const categoryMap = categories.reduce((acc, c) => {
      acc[c._id.toString()] = c;
      return acc;
    }, {} as Record<string, any>);

    const brandMap = brands.reduce((acc, b) => {
      acc[b._id.toString()] = b;
      return acc;
    }, {} as Record<string, any>);

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

  async getProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get images, category, brand
    const [images, category, brand] = await Promise.all([
      this.productImageModel.find({ productId: new Types.ObjectId(productId) }).lean(),
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

  async createProduct(createProductDto: CreateProductDto) {
    const { images, categoryId, brandId, ...productData } = createProductDto;

    // Validate categoryId
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel.findById(categoryId).lean();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate brandId if provided
    if (brandId) {
      if (!Types.ObjectId.isValid(brandId)) {
        throw new BadRequestException('Invalid brand ID');
      }
      const brand = await this.brandModel.findById(brandId).lean();
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    // Create product
    const product = new this.productModel({
      ...productData,
      categoryId: new Types.ObjectId(categoryId),
      brandId: brandId ? new Types.ObjectId(brandId) : null
    });

    const savedProduct = await product.save();

    // Create images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const imageDocuments = images.map((url: string, index: number) => ({
        productId: savedProduct._id,
        url,
        isPrimary: index === 0,
        altText: null
      }));

      await this.productImageModel.insertMany(imageDocuments);
    }

    return savedProduct;
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { images, ...productData } = updateProductDto;

    // Update product
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    ).lean();

    // Handle images if provided
    if (images && Array.isArray(images)) {
      // Delete old images
      await this.productImageModel.deleteMany({ productId: new Types.ObjectId(productId) });

      // Create new images
      const newImages = images.map((img: any) => ({
        productId: new Types.ObjectId(productId),
        url: img.url,
        altText: img.altText || null,
        isPrimary: img.isPrimary || false
      }));

      await this.productImageModel.insertMany(newImages);
    }

    return updatedProduct;
  }

  async deleteProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findByIdAndDelete(productId).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete associated images
    await this.productImageModel.deleteMany({ productId: new Types.ObjectId(productId) });

    return product;
  }

  async getAllOrders(page: number = 1, limit: number = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter)
    ]);

    // Get users
    const userIds = [...new Set(orders.map(o => o.userId.toString()))];
    const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {} as Record<string, any>);

    // Get order items
    const orderIds = orders.map(o => o._id);
    const orderItems = await this.orderItemModel.find({ orderId: { $in: orderIds } }).lean();
    const itemsByOrder = orderItems.reduce((acc, item) => {
      const key = item.orderId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);

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

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findById(orderId).lean();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updateData: any = { status };

    if (status === OrderStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    return this.orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).lean();
  }

  async getAllCustomers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.userModel.find({ role: UserRole.CUSTOMER }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments({ role: UserRole.CUSTOMER })
    ]);

    // Get order counts for each customer
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
    }, {} as Record<string, any>);

    const customersWithStats = customers.map(customer => ({
      ...customer,
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

  async getAllReviews(page: number = 1, limit: number = 10, approved?: boolean) {
    const skip = (page - 1) * limit;
    const filter = approved !== undefined ? { approved } : {};

    const [reviews, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.reviewModel.countDocuments(filter)
    ]);

    // Get users and products
    const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
    const productIds = [...new Set(reviews.map(r => r.productId.toString()))];

    const [users, products] = await Promise.all([
      this.userModel.find({ _id: { $in: userIds } }).lean(),
      this.productModel.find({ _id: { $in: productIds } }).lean()
    ]);

    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {} as Record<string, any>);

    const productMap = products.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {} as Record<string, any>);

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

  async approveReview(reviewId: string) {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      { approved: true },
      { new: true }
    ).lean();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async deleteReview(reviewId: string) {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findByIdAndDelete(reviewId).lean();
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateDeliveryCharge(charge: number) {
    return this.settingModel.findOneAndUpdate(
      { key: 'deliveryCharge' },
      { 
        key: 'deliveryCharge',
        value: charge.toString()
      },
      { upsert: true, new: true }
    ).lean();
  }

  async getDeliveryCharge() {
    const setting = await this.settingModel.findOne({ key: 'deliveryCharge' }).lean();
    return setting ? parseFloat(setting.value) : 0;
  }

  async updateAnnouncementBar(data: { enabled: boolean; message?: string; backgroundColor?: string; textColor?: string }) {
    const updateValue = JSON.stringify({
      enabled: data.enabled,
      message: data.message || '',
      backgroundColor: data.backgroundColor || '#000000',
      textColor: data.textColor || '#ffffff'
    });

    return this.settingModel.findOneAndUpdate(
      { key: 'announcementBar' },
      {
        key: 'announcementBar',
        value: updateValue
      },
      { upsert: true, new: true }
    ).lean();
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

  async updateDiscountSettings(data: { enabled: boolean; percentage?: number; minOrderAmount?: number }) {
    const updateValue = JSON.stringify({
      enabled: data.enabled,
      percentage: data.percentage || 0,
      minOrderAmount: data.minOrderAmount || 0
    });

    return this.settingModel.findOneAndUpdate(
      { key: 'discountSettings' },
      {
        key: 'discountSettings',
        value: updateValue
      },
      { upsert: true, new: true }
    ).lean();
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

    return JSON.parse(setting.value);
  }

  async seedInitialUsers() {
    const users = [
      {
        email: 'superadmin@glovia.com.np',
        password: 'SuperAdmin123!',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+977-9800000001',
        role: UserRole.SUPER_ADMIN,
        isEmailVerified: true,
        trustScore: 100,
      },
      {
        email: 'admin@glovia.com.np',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+977-9800000002',
        role: UserRole.ADMIN,
        isEmailVerified: true,
        trustScore: 100,
      },
      {
        email: 'vendor@glovia.com.np',
        password: 'Vendor123!',
        firstName: 'Vendor',
        lastName: 'Account',
        phone: '+977-9800000003',
        role: UserRole.VENDOR,
        isEmailVerified: true,
        trustScore: 75,
      },
      {
        email: 'user@glovia.com.np',
        password: 'User123!',
        firstName: 'Regular',
        lastName: 'User',
        phone: '+977-9800000004',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        trustScore: 50,
      },
    ];

    const createdUsers = [];

    for (const userData of users) {
      const existingUser = await this.userModel.findOne({ email: userData.email });
      if (existingUser) {
        createdUsers.push({
          email: userData.email,
          status: 'already_exists',
        });
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
}
