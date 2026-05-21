import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../database/schemas/user.schema';

/**
 * VendorAuthMiddleware: Enforces vendor data access control
 * - Vendors can only access their own products and orders
 * - Admins/SuperAdmins can access all vendor data
 * - Customers cannot access vendor-restricted endpoints
 */
@Injectable()
export class VendorAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Check if route requires vendor authorization
    const path = req.path;
    const method = req.method;

    // Routes that require vendor authorization
    const vendorProtectedRoutes = [
      /^\/api\/v1\/vendors\/orders\/my-orders/, // Vendor dashboard
      /^\/api\/v1\/products\/my-products/, // Vendor's own products (if implemented)
    ];

    // Check if current route is protected
    const isProtectedRoute = vendorProtectedRoutes.some(route => route.test(path));

    if (!isProtectedRoute) {
      return next();
    }

    // Get user from request (set by AuthGuard)
    const user = (req as any).user;

    if (!user) {
      throw new ForbiddenException('Authentication required for this resource');
    }

    // ADMIN and SUPERADMIN can access all resources
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return next();
    }

    // VENDOR can only access their own data
    if (user.role === 'VENDOR') {
      // For vendor-specific routes, vendor can only access their own data
      // The vendor ID from JWT is already in req.user.id
      
      // If accessing another vendor's data, throw error
      const vendorIdParam = req.params.vendorId;
      if (vendorIdParam && vendorIdParam !== user.id) {
        throw new ForbiddenException('You can only access your own vendor data');
      }

      return next();
    }

    // CUSTOMER cannot access vendor-restricted endpoints
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('Customers cannot access vendor endpoints');
    }

    return next();
  }
}

/**
 * Helper class for vendor authorization checks
 */
@Injectable()
export class VendorAuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Check if user can create products for a specific vendor
   * @param userId Current user ID
   * @param targetVendorId Vendor ID for product assignment
   * @param userRole User role from JWT
   * @returns true if authorized
   */
  async canCreateProductForVendor(
    userId: string,
    targetVendorId: string,
    userRole: string,
  ): Promise<boolean> {
    // SuperAdmin can create for any vendor
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // Admin can create for any vendor
    if (userRole === 'ADMIN') {
      return true;
    }

    // Vendor can only create for themselves
    if (userRole === 'VENDOR') {
      return userId === targetVendorId;
    }

    // Customer cannot create products
    return false;
  }

  /**
   * Check if user can view vendor's orders
   * @param userId Current user ID
   * @param targetVendorId Vendor ID whose orders to view
   * @param userRole User role from JWT
   * @returns true if authorized
   */
  async canViewVendorOrders(
    userId: string,
    targetVendorId: string,
    userRole: string,
  ): Promise<boolean> {
    // SuperAdmin can view all orders
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // Admin can view all orders
    if (userRole === 'ADMIN') {
      return true;
    }

    // Vendor can only view their own orders
    if (userRole === 'VENDOR') {
      return userId === targetVendorId;
    }

    // Customer cannot view vendor orders
    return false;
  }

  /**
   * Check if user can edit/delete a product
   * @param userId Current user ID
   * @param productVendorId Vendor ID who owns the product
   * @param userRole User role from JWT
   * @returns true if authorized
   */
  async canModifyProduct(
    userId: string,
    productVendorId: string,
    userRole: string,
  ): Promise<boolean> {
    // SuperAdmin can modify any product
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // Admin can modify any product
    if (userRole === 'ADMIN') {
      return true;
    }

    // Vendor can only modify their own products
    if (userRole === 'VENDOR') {
      return userId === productVendorId;
    }

    // Customer cannot modify products
    return false;
  }
}
