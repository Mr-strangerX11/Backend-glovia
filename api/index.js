const express = require('express');
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

  // Configure CORS first, before helmet
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configure helmet to not interfere with CORS
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));

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
  // Express app is a valid (req, res) handler - no serverless-http needed on Vercel
  return expressApp;
}

// Helper function to add CORS headers
function addCorsHeaders(res, origin) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://glovia.com.np',
    'https://www.glovia.com.np',
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.FRONTEND_URL) {
    const frontendUrls = process.env.FRONTEND_URL.split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    if (frontendUrls.length > 0) {
      res.setHeader('Access-Control-Allow-Origin', frontendUrls[0]);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://glovia.com.np');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
}

module.exports = async (req, res) => {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    addCorsHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  try {
    if (!cachedHandler) {
      cachedHandler = await createHandler();
    }
    return cachedHandler(req, res);
  } catch (error) {
    console.error('Function invocation failed:', error);
    addCorsHeaders(res, req.headers.origin);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
};
