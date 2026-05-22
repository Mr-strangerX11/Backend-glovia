import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

function parseCorsOrigins(value?: string): string[] {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);

  const port = process.env.PORT || configService.get<number>('PORT') || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Glovia Marketplace API running on port ${port}`);
  console.log(`✅ API prefix: ${configService.get<string>('API_PREFIX') || 'api/v1'}`);
}

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  const { AllExceptionsFilter } = await import(
    './common/filters/http-exception.filter'
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);

  // Strict global limits to prevent DoS and memory exhaustion
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ limit: '100kb', extended: true }));

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3010',
    'http://localhost:5000',
    'http://glovia.com.np',
    'https://glovia.com.np',
    'http://www.glovia.com.np',
    'https://www.glovia.com.np',
    'http://api.glovia.com.np',
    'https://api.glovia.com.np',
    'https://glovia-frontend-nu.vercel.app',
  ];

  corsOrigins.push(...parseCorsOrigins(process.env.CORS_ORIGIN));
  corsOrigins.push(...parseCorsOrigins(process.env.FRONTEND_URL));

  const allowedOrigins = [...new Set(corsOrigins)];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Glovia Marketplace API')
      .setDescription('E-Commerce Platform API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management')
      .addTag('Products', 'Product catalog')
      .addTag('Categories', 'Product categories')
      .addTag('Orders', 'Order management')
      .addTag('Payments', 'Payment processing')
      .addTag('Admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  return app;
}

if (require.main === module) {
  void bootstrap();
}

export { bootstrap };