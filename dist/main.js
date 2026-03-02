"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const compression = require("compression");
const helmet_1 = require("helmet");
const express_1 = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const { AllExceptionsFilter } = await Promise.resolve().then(() => require('./common/filters/http-exception.filter'));
    app.useGlobalFilters(new AllExceptionsFilter());
    const configService = app.get(config_1.ConfigService);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
    app.use((0, helmet_1.default)());
    const frontendUrls = (configService.get('FRONTEND_URL') || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);
    const fallbackOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const configuredOrigins = frontendUrls.length ? frontendUrls : fallbackOrigins;
    const normalizedAllowSet = new Set();
    const normalizeOrigin = (origin) => {
        try {
            const parsed = new URL(origin);
            const hostWithoutWww = parsed.hostname.replace(/^www\./, '');
            return `${parsed.protocol}//${hostWithoutWww}${parsed.port ? `:${parsed.port}` : ''}`;
        }
        catch {
            return origin;
        }
    };
    configuredOrigins.forEach((origin) => {
        normalizedAllowSet.add(origin);
        normalizedAllowSet.add(normalizeOrigin(origin));
        try {
            const parsed = new URL(origin);
            const withWww = `${parsed.protocol}//www.${parsed.hostname.replace(/^www\./, '')}${parsed.port ? `:${parsed.port}` : ''}`;
            const withoutWww = `${parsed.protocol}//${parsed.hostname.replace(/^www\./, '')}${parsed.port ? `:${parsed.port}` : ''}`;
            normalizedAllowSet.add(withWww);
            normalizedAllowSet.add(withoutWww);
        }
        catch {
        }
    });
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (normalizedAllowSet.has(origin) || normalizedAllowSet.has(normalizeOrigin(origin))) {
                callback(null, true);
                return;
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        },
        credentials: true,
    });
    app.use(compression());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = configService.get('PORT') || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Glovia Nepal API is running on: http://0.0.0.0:${port}/${apiPrefix}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map