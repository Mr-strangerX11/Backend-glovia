import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../../database/schemas/product.schema';
import { Order } from '../../database/schemas/order.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('OrderItem') private orderItemModel: Model<OrderItem>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  /**
   * Get all products for a specific vendor (Vendor Store)
   */
  async getVendorProducts(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    category?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const query: any = {
        vendorId: new Types.ObjectId(vendorId),
        isActive: true,
      };

      if (category) {
        query.categoryId = new Types.ObjectId(category);
      }

      const products = await this.productModel
        .find(query)
        .populate('categoryId', 'name')
        .populate('brandId', 'name logo')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await this.productModel.countDocuments(query);

      return {
        success: true,
        data: products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching vendor products: ${error.message}`);
    }
  }

  /**
   * Get vendor profile with summary
   */
  async getVendorProfile(vendorId: string) {
    try {
      // Validate vendor ID format
      if (!Types.ObjectId.isValid(vendorId)) {
        throw new NotFoundException('Invalid vendor ID');
      }

      const vendor = await this.userModel.findById(vendorId).select('-password').lean();

      if (!vendor || vendor.role !== 'VENDOR') {
        throw new NotFoundException('Vendor not found');
      }

      const productCount = await this.productModel.countDocuments({
        vendorId: new Types.ObjectId(vendorId),
        isActive: true,
      });

      const totalOrders = await this.orderItemModel.countDocuments({
        vendorId: new Types.ObjectId(vendorId),
      });

      return {
        success: true,
        vendor: {
          _id: vendor._id,
          name: vendor.firstName,
          email: vendor.email,
          phone: vendor.phone,
          vendorType: vendor.vendorType,
          vendorDescription: vendor.vendorDescription,
          vendorLogo: vendor.vendorLogo,
          productCount,
          totalOrders,
        },
      };
    } catch (error) {
      // Re-throw NotFoundException as-is to get 404 response
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Convert other errors to BadRequestException
      throw new BadRequestException(`Error fetching vendor profile: ${error.message}`);
    }
  }

  /**
   * Get vendor list for admin dropdown (with basic info)
   */
  async getVendorList(page: number = 1, limit: number = 100, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const query: any = { role: 'VENDOR' };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const vendors = await this.userModel
        .find(query)
        .select('_id firstName email phone vendorType vendorLogo')
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await this.userModel.countDocuments(query);

      return {
        success: true,
        data: vendors,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching vendor list: ${error.message}`);
    }
  }

  /**
   * Validate vendor exists
   */
  async validateVendor(vendorId: string) {
    const vendor = await this.userModel.findOne({
      _id: new Types.ObjectId(vendorId),
      role: 'VENDOR',
    }).lean();

    if (!vendor) {
      throw new NotFoundException('Vendor not found or invalid vendor ID');
    }

    return vendor;
  }

  /**
   * Get vendor orders (vendor dashboard)
   * Returns only orders where vendor has items
   */
  async getVendorOrders(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const vendorObjectId = new Types.ObjectId(vendorId);

      // Find orders with items for this vendor
      const query: any = { 'items.vendorId': vendorObjectId };
      if (status) {
        query.status = status;
      }

      const orders = await this.orderModel
        .find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('addressId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      // Filter items to only show vendor's items
      const filteredOrders = orders.map((order: any) => ({
        ...order,
        items: order.items?.filter((item: any) =>
          item.vendorId?.toString() === vendorId,
        ) || [],
        vendorTotal: (order.items || [])
          .filter((item: any) => item.vendorId?.toString() === vendorId)
          .reduce((sum: number, item: any) => sum + (item.total || 0), 0),
      }));

      const total = await this.orderModel.countDocuments(query);

      return {
        success: true,
        data: filteredOrders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching vendor orders: ${error.message}`);
    }
  }

  /**
   * Authorize vendor can access their own data only
   */
  async authorizeVendor(authenticatedVendorId: string, targetVendorId: string) {
    if (authenticatedVendorId !== targetVendorId) {
      throw new ForbiddenException('You are not authorized to access this vendor data');
    }
  }
}
