import { config as loadEnv } from 'dotenv';
import { AuditLogModule } from './modules/auditlog/auditlog.module';
import { FlashDealsModule } from './modules/flash-deals/flash-deals.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/prisma.module';
import { FirebaseModule } from './common/modules/firebase.module';
import { RedisModule } from './common/modules/redis.module';
import { EmailNotificationModule } from './common/services/email-notification.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BannersModule } from './modules/banners/banners.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { UploadModule } from './modules/upload/upload.module';
import { VerificationModule } from './modules/verification/verification.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { BrandsModule } from './modules/brands/brands.module';
import { PromoCodesModule } from './modules/promocodes/promocodes.module';
import { PopupsModule } from './modules/popups/popups.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AppController } from './app.controller';

loadEnv({ path: '.env.production' });
loadEnv({ path: '.env' });

const hasMongoConnectionString = Boolean(
  process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DB_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL,
);

const dbEnabledImports = [
  DatabaseModule,
  AuthModule,
  UsersModule,
  ProductsModule,
  CategoriesModule,
  BrandsModule,
  OrdersModule,
  PromoCodesModule,
  PopupsModule,
  AuditLogModule,
  PaymentsModule,
  AdminModule,
  CartModule,
  WishlistModule,
  ReviewsModule,
  BannersModule,
  BlogsModule,
  UploadModule,
  VerificationModule,
  VendorsModule,
  AnalyticsModule,
  AiModule,
  LoyaltyModule,
  WalletModule,
  SubscriptionsModule,
  FlashDealsModule,
  RealtimeModule,
];

const baseImports = [RedisModule, FirebaseModule, HealthModule];

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env'],
      expandVariables: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    EmailNotificationModule,
    ...(hasMongoConnectionString ? dbEnabledImports : []),
    ...baseImports,
  ],
})
export class AppModule {}
