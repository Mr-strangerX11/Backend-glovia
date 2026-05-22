import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'Glovia Marketplace API',
      health: '/api/v1/health',
    };
  }
}