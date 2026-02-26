import { Controller, Get, Query } from '@nestjs/common';

@Controller('recommendations')
export class RecommendationsController {
  @Get()
  getRecommendations(@Query('userId') userId: string, @Query('productId') productId: string) {
    // Starter logic: recommend popular products or similar products
    // TODO: Replace with real collaborative filtering
    return [
      { id: 'p1', name: 'Popular Product 1', price: 500 },
      { id: 'p2', name: 'Popular Product 2', price: 750 },
      { id: 'p3', name: 'Similar Product', price: 600 },
    ];
  }
}
