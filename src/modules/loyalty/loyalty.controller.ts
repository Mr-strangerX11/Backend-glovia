import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('loyalty')
export class LoyaltyController {
  @Get(':userId')
  getLoyalty(@Param('userId') userId: string) {
    // Starter logic: return loyalty points
    return { userId, points: 250 };
  }

  @Post('add')
  addPoints(@Body() body: { userId: string; points: number }) {
    // Starter logic: add points
    return { userId: body.userId, points: 250 + body.points };
  }
}
