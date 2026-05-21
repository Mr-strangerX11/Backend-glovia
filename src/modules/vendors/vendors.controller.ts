import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  /**
   * Admin/SuperAdmin: Get vendor list for dropdown
   * Endpoint: GET /api/v1/vendors/list/admin
   * MUST be before :vendorId routes to avoid route conflicts
   */
  @Get('list/admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor list for admin dropdown' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getVendorList(
    @CurrentUser('role') role: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
    @Query('search') search?: string,
  ) {
    // Only admin and superadmin can view vendor list
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new Error('Only admin can access vendor list');
    }

    return this.vendorsService.getVendorList(page, limit, search);
  }

  /**
   * Vendor: Get own orders
   * Endpoint: GET /api/v1/vendors/orders/my-orders
   * MUST be before :vendorId routes to avoid route conflicts
   */
  @Get('orders/my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor own orders (vendor dashboard)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getVendorOrders(
    @CurrentUser('id') vendorId: string,
    @CurrentUser('role') role: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    // Only vendors can access their own orders
    if (role !== 'VENDOR') {
      throw new Error('Only vendors can access this endpoint');
    }

    return this.vendorsService.getVendorOrders(vendorId, page, limit, status);
  }

  /**
   * Public: Get vendor store products
   * Endpoint: GET /api/v1/vendors/:vendorId/products
   * MUST be after specific routes (list/admin, orders/my-orders)
   */
  @Get(':vendorId/products')
  @ApiOperation({ summary: 'Get all products for a vendor (vendor store)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  async getVendorProducts(
    @Param('vendorId') vendorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
  ) {
    return this.vendorsService.getVendorProducts(vendorId, page, limit, category);
  }

  /**
   * Public: Get vendor profile
   * Endpoint: GET /api/v1/vendors/:vendorId/profile
   * MUST be after specific routes (list/admin, orders/my-orders)
   */
  @Get(':vendorId/profile')
  @ApiOperation({ summary: 'Get vendor profile with summary' })
  async getVendorProfile(@Param('vendorId') vendorId: string) {
    return this.vendorsService.getVendorProfile(vendorId);
  }
}
