import { INestApplication } from '@nestjs/common';

export function getServer(app: INestApplication) {
  return app.getHttpServer();
}

