import { INestApplication } from '@nestjs/common';
import { Model, Types } from 'mongoose';

export type SeedIds = {
  vendorUserId: string;
  customerUserId: string;
  customerAddressId: string;
  productId: string;
};

export async function seedVendorEmailPrivacy(app: INestApplication): Promise<SeedIds> {
  const vendorUserModel = app.get<Model<any>>('UserModel');
  const addressModel = app.get<Model<any>>('AddressModel');
  const productModel = app.get<Model<any>>('ProductModel');

  if (!vendorUserModel || !addressModel || !productModel) {
    // fallback: try by default Mongoose injection tokens
    // (this app currently does not define these providers, so this file may be replaced)
    throw new Error('Seed helper could not resolve Mongoose models.');
  }

  // This helper relies on test-app exposing model bindings.
  // If the token wiring differs, adjust to use app.getModelToken(...) in test setup.
  const vendorId = new Types.ObjectId().toString();
  const customerId = new Types.ObjectId().toString();
  const addressId = new Types.ObjectId().toString();
  const productId = new Types.ObjectId().toString();

  const vendor = await vendorUserModel.create({
    _id: vendorId,
    email: `vendor_${Date.now()}@example.com`,
    phone: '9801111111',
    password: '$2a$10$seededhashseededhashseededhashseeded',
    firstName: 'Vendor',
    lastName: 'QA',
    role: 'VENDOR',
    isEmailVerified: true,
    isPhoneVerified: false,
    trustScore: 0,
    vendorType: 'BEAUTY',
    vendorDescription: 'Seed vendor',
    vendorLogo: 'https://example.com/logo.png',
    isFrozen: false,
    isFrozenAt: null,
    isBlocked: false,
    isFrozenReason: null,
    isBlockedAt: null,
    failedAttempts: 0,
  });

  const customer = await vendorUserModel.create({
    _id: customerId,
    email: `customer_${Date.now()}@example.com`,
    phone: '9802222222',
    password: '$2a$10$seededhashseededhashseededhashseeded',
    firstName: 'Customer',
    lastName: 'QA',
    role: 'CUSTOMER',
    isEmailVerified: true,
    isPhoneVerified: false,
    trustScore: 0,
    vendorType: undefined,
    isFrozen: false,
    failedAttempts: 0,
    isBlocked: false,
  });

  const address = await addressModel.create({
    _id: addressId,
    userId: customerId,
    fullName: 'Customer QA',
    phone: '9802222222',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    wardNo: 9,
    area: 'Thamel',
    landmark: 'Near Gate',
    isDefault: true,
  });

  const product = await productModel.create({
    _id: productId,
    name: `Seed Product ${Date.now()}`,
    slug: `seed-${Date.now()}`,
    description: 'Seed product',
    price: 100,
    compareAtPrice: 0,
    discountPercentage: 0,
    costPrice: 0,
    sku: `SKU-${Date.now()}`,
    barcode: `BC-${Date.now()}`,
    stockQuantity: 10,
    quantityMl: 100,
    lowStockThreshold: 10,
    weight: 100,
    ingredients: '[]',
    benefits: '[]',
    howToUse: '[]',
    categoryId: new Types.ObjectId(),
    brandId: new Types.ObjectId(),
    vendorId: vendorId,
    suitableFor: ['NORMAL'],
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewProduct: false,
    metaTitle: 'Seed',
    metaDescription: 'Seed',
    tags: [],
  });

  return {
    vendorUserId: vendor._id.toString(),
    customerUserId: customer._id.toString(),
    customerAddressId: address._id.toString(),
    productId: product._id.toString(),
  };
}

