import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all brands
  async getAllBrands(includeProducts = false) {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        products: includeProducts ? { select: { id: true } } : false,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Public: Get brand by slug with products
  async getBrandBySlug(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            images: true,
            stockQuantity: true,
            categoryId: true,
            brand: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // Public: Get brand by ID with product count
  async getBrandById(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          select: { id: true },
          take: 5,
        },
      },
    });
  }

  // Admin: Create new brand
  async createBrand(dto: CreateBrandDto) {
    // Generate slug from name if not provided
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        logo: dto.logo,
        isActive: true,
      },
    });
  }

  // Admin: Update brand
  async updateBrand(id: string, dto: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logo: dto.logo,
        isActive: dto.isActive,
      },
    });
  }

  // Admin: Soft delete brand (deactivate)
  async deleteBrand(id: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Admin: Hard delete brand (only if no products)
  async hardDeleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (brand?._count?.products! > 0) {
      throw new Error('Cannot delete brand with associated products');
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }

  // Admin: Get brand analytics for dashboard
  async getBrandAnalytics() {
    const totalBrands = await this.prisma.brand.count({
      where: { isActive: true },
    });

    const activeBrands = await this.prisma.brand.count({
      where: { isActive: true },
    });

    // Top brands by product count
    const topBrands = await this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get brands with revenue data (via products)
    const brandsWithRevenue = await this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    const brandPerformance = brandsWithRevenue
      .map((brand) => {
        const revenue = brand.products.reduce((total, product) => {
          return (
            total +
            product.orderItems.reduce((sum, item: any) => {
              return sum + (item.quantity * (item.price as number || 0));
            }, 0)
          );
        }, 0);

        return {
          id: brand.id,
          name: brand.name,
          productCount: brand.products.length,
          revenue,
          logo: brand.logo,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalBrands,
      activeBrands,
      topBrands: topBrands.map((b) => ({
        id: b.id,
        name: b.name,
        productCount: b._count.products,
        logo: b.logo,
      })),
      brandPerformance,
    };
  }

  // Get brands for dropdown (lightweight)
  async getBrandsList() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
