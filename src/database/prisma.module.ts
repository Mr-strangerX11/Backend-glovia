import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as schemas from './schemas';

function resolveMongoUri(configService: ConfigService): string {
  const mongoUri =
    configService.get<string>('MONGO_URI') ||
    configService.get<string>('MONGO_URL') ||
    configService.get<string>('DB_URL') ||
    configService.get<string>('MONGODB_URI') ||
    configService.get<string>('DATABASE_URL') ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DB_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error(
      'MongoDB connection string is missing. Set MONGODB_URI or DATABASE_URL.',
    );
  }

  return mongoUri;
}

const hasMongoConnectionString = Boolean(
  process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DB_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL,
);

const mongooseConnectionImports = hasMongoConnectionString
  ? [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: resolveMongoUri(configService),
          retryAttempts: 3,
          retryDelay: 1000,
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forFeature([
        { name: 'User', schema: schemas.UserSchema },
        { name: 'Address', schema: schemas.AddressSchema },
        { name: 'Category', schema: schemas.CategorySchema },
        { name: 'Brand', schema: schemas.BrandSchema },
        { name: 'Product', schema: schemas.ProductSchema },
        { name: 'ProductImage', schema: schemas.ProductImageSchema },
        { name: 'CartItem', schema: schemas.CartItemSchema },
        { name: 'WishlistItem', schema: schemas.WishlistItemSchema },
        { name: 'Order', schema: schemas.OrderSchema },
        { name: 'OrderItem', schema: schemas.OrderItemSchema },
        { name: 'Payment', schema: schemas.PaymentSchema },
        { name: 'Review', schema: schemas.ReviewSchema },
        { name: 'Coupon', schema: schemas.CouponSchema },
        { name: 'Banner', schema: schemas.BannerSchema },
        { name: 'Blog', schema: schemas.BlogSchema },
        { name: 'OtpVerification', schema: schemas.OtpVerificationSchema },
        { name: 'Setting', schema: schemas.SettingSchema },
      ]),
    ]
  : [];

@Global()
@Module({
  imports: mongooseConnectionImports,
  exports: [MongooseModule],
})
export class DatabaseModule {}
