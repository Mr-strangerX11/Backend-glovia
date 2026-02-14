const path = require('path');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { ConfigService } = require('@nestjs/config');
const helmet = require('helmet');
const compression = require('compression');

// Try loading from dist first, fallback to src for development
let AppModule;
try {
  AppModule = require(path.join(__dirname, '../dist/app.module')).AppModule;
} catch (err) {
  console.error('Failed to load compiled module from dist:', err.message);
  console.error('Trying alternative path...');
  try {
    AppModule = require(path.join(__dirname, '../src/app.module')).AppModule;
  } catch (err2) {
    console.error('Both module loads failed. Build may not have completed.');
    throw new Error(`Cannot find AppModule. ${err.message}`);
  }
}

let cachedHandler = null;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

async function createHandler() {
  const expressApp = express();
  
  // Set CORS headers immediately for all requests
  expressApp.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://glovia.com.np',
      'https://www.glovia.com.np',
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Allow requests without origin (for health checks, etc)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('X-Powered-By', 'Glovia-Backend');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });
  
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  const configService = app.get(ConfigService);

  const frontendUrls = (configService.get('FRONTEND_URL') || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const allowedOrigins =
    frontendUrls.length > 0
      ? frontendUrls
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://glovia.com.np',
          'https://www.glovia.com.np',
        ];

  // Configure CORS in NestJS (backup for routes after global prefix)
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

  // Root health endpoint (before global prefix)
  expressApp.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Glovia Nepal Backend API',
      version: '1.0.0',
      endpoints: {
        api: `/${apiPrefix}`,
        docs: process.env.NODE_ENV !== 'production' ? '/api/docs' : 'disabled',
      },
    });
  });

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

// Same default frontend URLs as in createHandler – keep in sync
const DEFAULT_FRONTEND_URLS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://glovia.com.np',
  'https://www.glovia.com.np',
];

function getAllowedOrigins() {
  const fromEnv = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_FRONTEND_URLS;
}

function addCorsHeaders(res, origin) {
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0] || 'https://glovia.com.np';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
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
