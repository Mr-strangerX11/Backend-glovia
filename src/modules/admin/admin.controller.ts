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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/schemas/user.schema';
import { OrderStatus } from '../../database/schemas/order.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateUserDto } from './dto/user.dto';
import { UpdateOrderDto } from './dto/order.dto';
import { UpdateDeliverySettingsDto } from './dto/settings.dto';
import { UpdateAnnouncementDto } from './dto/announcement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

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
    @Body('role') role: UserRole,
    @CurrentUser('role') actorRole: UserRole,
  ) {
    return this.adminService.updateUserRole(id, role, actorRole);
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

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
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
  @ApiOperation({ summary: 'Initialize default users (Super Admin, Admin, Vendor, User)' })
  async initializeUsers() {
    const result = await this.adminService.seedInitialUsers();
    return {
      status: 'success',
      message: 'Initial users created successfully',
      data: result,
    };
  }
}
