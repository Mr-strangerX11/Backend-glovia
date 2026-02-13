import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SkinType } from '../../database/schemas/user.schema';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'skinType', required: false, enum: SkinType })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isBestSeller', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) {
    return this.productsService.findAll({
      ...query,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      isFeatured: query.isFeatured ? query.isFeatured === 'true' : undefined,
      isBestSeller: query.isBestSeller ? query.isBestSeller === 'true' : undefined,
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeaturedProducts(
      limit ? Number(limit) : undefined,
    );
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best seller products' })
  getBestSellers(@Query('limit') limit?: string) {
    return this.productsService.getBestSellers(
      limit ? Number(limit) : undefined,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  getRelated(
    @Param('id') id: string,
    @Query('categoryId') categoryId: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.getRelatedProducts(
      id,
      categoryId,
      limit ? Number(limit) : undefined,
    );
  }
}
