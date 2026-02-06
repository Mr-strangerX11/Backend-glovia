import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { HttpCode } from '@nestjs/common';
import { UserRole } from '../../database/schemas/user.schema';
import { OrderStatus } from '../../database/schemas/order.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { UpdateOrderDto } from './dto/order.dto';
import { UpdateDeliverySettingsDto } from './dto/settings.dto';
import { UpdateAnnouncementDto } from './dto/announcement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadService } from '../upload/upload.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private uploadService: UploadService,
  ) {}

  private parseProductFormData(body: any) {
    const parseNumber = (value: any) => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      return Number.isNaN(num) ? undefined : num;
    };

    const parseBoolean = (value: any) => {
      if (value === true || value === false) return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return undefined;
    };

    const parseArray = (value: any) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return undefined;
    };

    return {
      ...body,
      price: parseNumber(body.price),
      compareAtPrice: parseNumber(body.compareAtPrice),
      stockQuantity: parseNumber(body.stockQuantity),
      discountPercentage: parseNumber(body.discountPercentage),
      isFeatured: parseBoolean(body.isFeatured),
      isBestSeller: parseBoolean(body.isBestSeller),
      isNew: parseBoolean(body.isNew),
      suitableFor: parseArray(body.suitableFor),
      tags: parseArray(body.tags),
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user with role' })
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('role') actorRole: UserRole,
  ) {
    return this.adminService.updateUserRole(id, dto.role, actorRole);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create new product' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Post('products/with-images')
  @ApiOperation({ summary: 'Create product with image upload' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createProductWithImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const payload = this.parseProductFormData(body) as CreateProductDto;
    if (files && files.length > 0) {
      const urls = await this.uploadService.uploadMultiple(files, 'products');
      payload.images = urls;
    }

    return this.adminService.createProduct(payload);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Put('products/:id/with-images')
  @ApiOperation({ summary: 'Update product with image upload' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateProductWithImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const payload: any = this.parseProductFormData(body);
    if (files && files.length > 0) {
      const urls = await this.uploadService.uploadMultiple(files, 'products');
      payload.images = urls.map((url: string, index: number) => ({
        url,
        isPrimary: index === 0,
      }));
    }

    return this.adminService.updateProduct(id, payload);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  getAllOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllOrders(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status as any
    );
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update order status' })
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.adminService.updateOrderStatus(id, dto.status);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all customers' })
  getAllCustomers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllCustomers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews' })
  getAllReviews(
    @Query('isApproved') isApproved?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllReviews(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      isApproved ? isApproved === 'true' : undefined
    );
  }

  @Patch('reviews/:id/approve')
  @ApiOperation({ summary: 'Approve review' })
  approveReview(@Param('id') id: string) {
    return this.adminService.approveReview(id);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete review' })
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('settings/delivery')
  @ApiOperation({ summary: 'Get delivery charge' })
  getDeliverySettings() {
    return this.adminService.getDeliveryCharge();
  }

  @Put('settings/delivery')
  @ApiOperation({ summary: 'Update delivery charge' })
  updateDeliverySettings(@Body() dto: UpdateDeliverySettingsDto) {
    return this.adminService.updateDeliveryCharge(dto.charge);
  }

  @Get('settings/announcement')
  @ApiOperation({ summary: 'Get announcement bar settings' })
  getAnnouncement() {
    return this.adminService.getAnnouncementBar();
  }

  @Put('settings/announcement')
  @ApiOperation({ summary: 'Update announcement bar' })
  updateAnnouncement(@Body() dto: UpdateAnnouncementDto) {
    return this.adminService.updateAnnouncementBar(dto);
  }

  @Post('init')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Initialize default users (Super Admin, Admin, Vendor, User)' })
  async initializeUsers() {
    try {
      const result = await this.adminService.seedInitialUsers();
      return {
        status: 'success',
        message: 'Initial users created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Init users failed:', error);
      return {
        status: 'error',
        message: error?.message || 'Failed to initialize users',
      };
    }
  }
}
