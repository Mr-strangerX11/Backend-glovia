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
import { UserRole, OrderStatus } from '@prisma/client';
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
    @Query('status') status?: OrderStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllOrders({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update order' })
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.adminService.updateOrder(id, dto);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all customers' })
  getAllCustomers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllCustomers(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews' })
  getAllReviews(
    @Query('isApproved') isApproved?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllReviews({
      isApproved: isApproved === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
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
  @ApiOperation({ summary: 'Get delivery settings' })
  getDeliverySettings() {
    return this.adminService.getDeliverySettings();
  }

  @Put('settings/delivery')
  @ApiOperation({ summary: 'Update delivery settings (discount and free delivery)' })
  updateDeliverySettings(@Body() dto: UpdateDeliverySettingsDto) {
    return this.adminService.updateDeliverySettings(dto);
  }

  @Get('settings/announcement')
  @ApiOperation({ summary: 'Get announcement bar settings' })
  getAnnouncement() {
    return this.adminService.getAnnouncement();
  }

  @Put('settings/announcement')
  @ApiOperation({ summary: 'Update announcement bar' })
  updateAnnouncement(@Body() dto: UpdateAnnouncementDto) {
    return this.adminService.updateAnnouncement(dto);
  }
}
