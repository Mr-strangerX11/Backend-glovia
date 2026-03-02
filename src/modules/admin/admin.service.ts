import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../database/schemas/user.schema';
import { Product } from '../../database/schemas/product.schema';
import { Order, OrderStatus } from '../../database/schemas/order.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { Review } from '../../database/schemas/review.schema';
import { Category } from '../../database/schemas/category.schema';
import { Brand } from '../../database/schemas/brand.schema';
import { ProductImage } from '../../database/schemas/product-image.schema';
import { Setting } from '../../database/schemas/setting.schema';
import { AuditLog } from '../../database/schemas/audit.schema';
import { Address } from '../../database/schemas/address.schema';
import { SettingVersion } from '../../database/schemas/setting-version.schema';
import { CreateUserDto } from './dto/user.dto';
import { UpdateProductDto, CreateProductDto } from './dto/product.dto';
import { EmailNotificationService } from '../../common/services/email-notification.service';

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
    @InjectModel(Address.name) private addressModel: Model<Address>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(SettingVersion.name) private settingVersionModel: Model<SettingVersion>,
    private emailNotificationService: EmailNotificationService,
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
    const totalUsers = await this.userModel.countDocuments();
    const totalAdmins = await this.userModel.countDocuments({ role: UserRole.ADMIN });
    const totalVendors = await this.userModel.countDocuments({ role: UserRole.VENDOR });
    const totalProducts = await this.productModel.countDocuments();
    const pendingOrders = await this.orderModel.countDocuments({ status: OrderStatus.PENDING });

    // Recent orders with user info
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    const userIds = [...new Set(
      recentOrders
        .map((o) => o?.userId?.toString?.())
        .filter(Boolean)
    )];
    const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {} as Record<string, any>);

    const recentOrdersWithUsers = recentOrders.map(order => ({
      ...order,
      user: order?.userId ? userMap[order.userId.toString()] || null : null
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
      totalUsers,
      totalAdmins,
      totalVendors,
      totalProducts,
      pendingOrders,
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

    // Enforce strong password for ADMIN, SUPER_ADMIN, VENDOR
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if ((createUserDto.role === UserRole.ADMIN || createUserDto.role === UserRole.SUPER_ADMIN || createUserDto.role === UserRole.VENDOR) && !strong.test(createUserDto.password)) {
      throw new BadRequestException('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.toObject();
  }

  async getAllUsers(page: number = 1, limit: number = 10, role?: UserRole) {
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
    const { images, categoryId, brandId, isNew, ...productData } = createProductDto;
    const sanitize = (str: any) => typeof str === 'string' ? str.replace(/[<>"'`;]/g, '') : str;
    try {
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
      // Check for unique SKU
      const existingSku = await this.productModel.findOne({ sku: productData.sku });
      if (existingSku) {
        throw new BadRequestException('SKU must be unique');
      }
      // Check for unique slug
      const existingSlug = await this.productModel.findOne({ slug: productData.slug });
      if (existingSlug) {
        throw new BadRequestException('Slug must be unique');
      }
      // Sanitize string fields
      const sanitizedData: any = {};
      for (const key in productData) {
        sanitizedData[key] = sanitize(productData[key]);
      }
      // Create product - map isNew to isNewProduct
      const product = new this.productModel({
        ...sanitizedData,
        categoryId: new Types.ObjectId(categoryId),
        brandId: brandId ? new Types.ObjectId(brandId) : null,
        isNewProduct: isNew !== undefined ? isNew : false,
      });
      const savedProduct = await product.save();
      // Create images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        const imageDocuments = images.map((url: string, index: number) => ({
          productId: savedProduct._id,
          url: sanitize(url),
          isPrimary: index === 0,
          altText: null
        }));
        await this.productImageModel.insertMany(imageDocuments);
      }
      return savedProduct;
    } catch (error) {
      // Log error for monitoring
      console.error('Product creation failed:', error?.message || error);
      throw error;
    }
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { images, isNew, categoryId, brandId, ...productData } = updateProductDto;

    // Map isNew to isNewProduct
    const updateData: any = { ...productData };
    if (isNew !== undefined) {
      updateData.isNewProduct = isNew;
    }

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid category ID');
      }
      updateData.categoryId = new Types.ObjectId(categoryId);
    }

    if (brandId) {
      if (!Types.ObjectId.isValid(brandId)) {
        throw new BadRequestException('Invalid brand ID');
      }
      updateData.brandId = new Types.ObjectId(brandId);
    }

    // Update product
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      updateData,
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

  async getOrderDetails(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findById(orderId).lean();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get user details
    const user = await this.userModel.findById(order.userId).lean();

    // Get order items
    const orderItems = await this.orderItemModel.find({ orderId: order._id }).lean();

    return {
      ...order,
      user: user || null,
      items: orderItems || []
    };
  }

  async getAllOrders(page: number = 1, limit: number = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter)
    ]);

    // Get users
    const userIds = [...new Set(
      orders
        .map((o) => o?.userId?.toString?.())
        .filter(Boolean)
    )];
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
      user: order?.userId ? userMap[order.userId.toString()] || null : null,
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

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).lean();

    if (status === OrderStatus.CONFIRMED) {
      await this.sendOrderConfirmationEmail(orderId);
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Delete associated order items first
    await this.orderItemModel.deleteMany({ orderId: order._id });

    // Delete the order
    await this.orderModel.findByIdAndDelete(orderId);

    return {
      message: 'Order deleted successfully',
      deletedOrderId: orderId
    };
  }

  private async sendOrderConfirmationEmail(orderId: string): Promise<void> {
    try {
      const order = await this.orderModel.findById(orderId).lean();
      if (!order) return;

      const user = await this.userModel.findById(order.userId).lean();
      if (!user?.email) return;

      const address = await this.addressModel.findById(order.addressId).lean();
      const items = await this.orderItemModel.find({ orderId: order._id }).lean();
      const productIds = items.map((item) => item.productId);
      const products = await this.productModel.find({ _id: { $in: productIds } }).lean();
      const productMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product;
        return acc;
      }, {} as Record<string, any>);

      const emailItems = items.map((item) => {
        const product = productMap[item.productId.toString()];
        return {
          name: product?.name || 'Product',
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
        };
      });

      const adminEmail = process.env.ADMIN_ORDER_EMAIL || process.env.ADMIN_EMAIL;

      await this.emailNotificationService.sendOrderConfirmedEmail(
        {
          orderNumber: order.orderNumber,
          total: Number(order.total),
          subtotal: Number(order.subtotal),
          discount: Number(order.discount),
          deliveryCharge: Number(order.deliveryCharge),
          paymentMethod: order.paymentMethod,
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
          customerEmail: user.email,
          items: emailItems,
          address: {
            fullName: address?.fullName || 'Customer',
            phone: address?.phone || '',
            province: address?.province || '',
            district: address?.district || '',
            municipality: address?.municipality || '',
            wardNo: address?.wardNo || 0,
            area: address?.area || '',
            landmark: address?.landmark || undefined,
          },
        },
        adminEmail,
      );
    } catch (error) {
      // Do not block order update on email failure
    }
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

  async updateDeliverySettings(data: { freeDeliveryThreshold: number; valleyDeliveryCharge: number; outsideValleyDeliveryCharge: number }, user?: { userId?: string, username?: string }) {
    const prev = await this.settingModel.findOne({ key: 'deliverySettings' }).lean();
    const settingsValue = JSON.stringify(data);
    // Versioning: Save previous version if exists
    if (prev) {
      const lastVersion = await this.settingVersionModel.find({ key: 'deliverySettings' }).sort({ version: -1 }).limit(1).lean();
      const nextVersion = lastVersion.length > 0 ? lastVersion[0].version + 1 : 1;
      await this.settingVersionModel.create({
        key: 'deliverySettings',
        value: prev.value,
        userId: user?.userId,
        username: user?.username,
        version: nextVersion
      });
    }
    const updated = await this.settingModel.findOneAndUpdate(
      { key: 'deliverySettings' },
      {
        key: 'deliverySettings',
        value: settingsValue
      },
      { upsert: true, new: true }
    ).lean();
    await this.auditLogModel.create({
      action: 'update',
      entity: 'deliverySettings',
      userId: user?.userId,
      username: user?.username,
      before: prev ? prev.value : '',
      after: settingsValue
    });
    return updated;
  }

  async getDeliverySettings() {
    const setting = await this.settingModel.findOne({ key: 'deliverySettings' }).lean();
    if (!setting) {
      return { 
        freeDeliveryThreshold: 2999,
        valleyDeliveryCharge: 99,
        outsideValleyDeliveryCharge: 149
      };
    }
    try {
      return JSON.parse(setting.value);
    } catch {
      return {
        freeDeliveryThreshold: 2999,
        valleyDeliveryCharge: 99,
        outsideValleyDeliveryCharge: 149
      };
    }
  }

  async updateAnnouncementBar(data: { enabled?: boolean; message?: string; backgroundColor?: string; textColor?: string }, user?: { userId?: string, username?: string }) {
    const prev = await this.settingModel.findOne({ key: 'announcementBar' }).lean();
    const enabled = typeof data.enabled === 'boolean' ? data.enabled : true;
    const message = data.message ?? '';
    const updateValue = JSON.stringify({
      enabled,
      message,
      backgroundColor: data.backgroundColor || '#FFD700',
      textColor: data.textColor || '#000000'
    });
    // Versioning: Save previous version if exists
    if (prev) {
      const lastVersion = await this.settingVersionModel.find({ key: 'announcementBar' }).sort({ version: -1 }).limit(1).lean();
      const nextVersion = lastVersion.length > 0 ? lastVersion[0].version + 1 : 1;
      await this.settingVersionModel.create({
        key: 'announcementBar',
        value: prev.value,
        userId: user?.userId,
        username: user?.username,
        version: nextVersion
      });
    }
    const updated = await this.settingModel.findOneAndUpdate(
      { key: 'announcementBar' },
      {
        key: 'announcementBar',
        value: updateValue
      },
      { upsert: true, new: true }
    ).lean();
    await this.auditLogModel.create({
      action: 'update',
      entity: 'announcementBar',
      userId: user?.userId,
      username: user?.username,
      before: prev ? prev.value : '',
      after: updateValue
    });
    return updated;
  }

  async getAnnouncementBar() {
    const setting = await this.settingModel.findOne({ key: 'announcementBar' }).lean();
    if (!setting) {
      return {
        enabled: false,
        isActive: false,
        message: '',
        text: '',
        icon: '🚚',
        backgroundColor: '#000000',
        textColor: '#ffffff'
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(setting.value);
    } catch {
      parsed = {
        enabled: false,
        message: '',
        backgroundColor: '#000000',
        textColor: '#ffffff'
      };
    }
    return {
      ...parsed,
      isActive: parsed.enabled,
      text: parsed.message,
      icon: parsed.icon || '🚚'
    };
  }

  async updateDiscountSettings(data: { enabled: boolean; percentage?: number; minOrderAmount?: number }, user?: { userId?: string, username?: string }) {
    const prev = await this.settingModel.findOne({ key: 'discountSettings' }).lean();
    const updateValue = JSON.stringify({
      enabled: data.enabled,
      percentage: data.percentage || 0,
      minOrderAmount: data.minOrderAmount || 0
    });
    // Versioning: Save previous version if exists
    if (prev) {
      const lastVersion = await this.settingVersionModel.find({ key: 'discountSettings' }).sort({ version: -1 }).limit(1).lean();
      const nextVersion = lastVersion.length > 0 ? lastVersion[0].version + 1 : 1;
      await this.settingVersionModel.create({
        key: 'discountSettings',
        value: prev.value,
        userId: user?.userId,
        username: user?.username,
        version: nextVersion
      });
    }
    const updated = await this.settingModel.findOneAndUpdate(
      { key: 'discountSettings' },
      {
        key: 'discountSettings',
        value: updateValue
      },
      { upsert: true, new: true }
    ).lean();
    await this.auditLogModel.create({
      action: 'update',
      entity: 'discountSettings',
      userId: user?.userId,
      username: user?.username,
      before: prev ? prev.value : '',
      after: updateValue
    });
    return updated;
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
    } catch (e) {
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
        throw new NotFoundException('No categories found. Please seed categories first using POST /categories/seed');
      }

      return {
        data: categories,
        count: categories.length,
        message: 'Categories retrieved successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve categories');
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
        // Update role if it's incorrect (especially for superadmin)
        if (existingUser.role !== userData.role && userData.role === UserRole.SUPER_ADMIN) {
          await this.userModel.findByIdAndUpdate(existingUser._id, { role: userData.role });
          createdUsers.push({
            email: userData.email,
            status: 'role_updated_to_SUPER_ADMIN',
          });
        } else {
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
      throw new NotFoundException('SuperAdmin user not found');
    }

    if (superadmin.role === UserRole.SUPER_ADMIN) {
      return { email: superadmin.email, role: superadmin.role, status: 'already_correct' };
    }

    await this.userModel.findByIdAndUpdate(superadmin._id, { role: UserRole.SUPER_ADMIN });
    return { email: superadmin.email, oldRole: superadmin.role, newRole: UserRole.SUPER_ADMIN, status: 'updated' };
  }
}
