const express = require('express');
const serverless = require('serverless-http');
const helmet = require('helmet');
const compression = require('compression');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { ConfigService } = require('@nestjs/config');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../dist/app.module');

let cachedHandler = null;

async function createHandler() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  const configService = app.get(ConfigService);

  app.use(helmet());

  const frontendUrls = (configService.get('FRONTEND_URL') || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const allowedOrigins = frontendUrls.length
    ? frontendUrls
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://glovia.com.np',
        'https://www.glovia.com.np',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
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

  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Glovia Nepal API')
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

  await app.init();
  return serverless(expressApp);
}

module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      cachedHandler = await createHandler();
    }
    return cachedHandler(req, res);
  } catch (error) {
    console.error('Function invocation failed:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
};
