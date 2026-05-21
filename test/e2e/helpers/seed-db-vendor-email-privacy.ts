import { INestApplication } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';

type AnyModel = Model<any>;

export type SeedVendorEmailPrivacyResult = {
  vendorId: string;
  customerId: string;
  addressId: string;
  productId: string;
  vendorAccessToken: string;
  customerAccessToken: string;
};

import { getModelToken } from '@nestjs/mongoose';

function getModel(app: INestApplication, modelClassName: string): AnyModel {
  // Use Nest Mongoose injection token resolution (matches @InjectModel(Model.name)).
  // Example: app.get(getModelToken(User.name))
  const token = getModelToken(modelClassName);
  return app.get(token as any);
}


export async function seedDbVendorEmailPrivacy(app: INestApplication): Promise<SeedVendorEmailPrivacyResult> {
  const userModel = getModel(app, 'User');
  const addressModel = getModel(app, 'Address');
  const productModel = getModel(app, 'Product');


  const seedPassword = 'seed-password';
  // AuthService uses bcrypt.compare(password, user.password)
  // so we must hash with bcryptjs (same rounds as production: 10).
  const passwordHash = await (await import('bcryptjs')).hash(seedPassword, 10);



  // Generate stable IDs
  const vendorId = new Types.ObjectId().toString();
  const customerId = new Types.ObjectId().toString();
  const addressId = new Types.ObjectId().toString();
  const productId = new Types.ObjectId().toString();

  // Minimal required related fields (Category/Brand) exist as ObjectId placeholders.
  const categoryId = new Types.ObjectId();
  const brandId = new Types.ObjectId();

  // Seed users
  await userModel.deleteMany({ _id: { $in: [vendorId, customerId] } });

  await userModel.create({
    _id: vendorId,
    email: `vendor_${Date.now()}@example.com`,
    phone: '9801111111',
    password: passwordHash,
    firstName: 'Vendor',
    lastName: 'QA',
    role: 'VENDOR',
    permissions: {},
    isEmailVerified: true,
    isPhoneVerified: false,
    loyaltyPoints: 0,
    trustScore: 0,
    isBlocked: false,
    failedAttempts: 0,
    isFrozen: false,
    isFeatured: true,
    vendorType: 'BEAUTY',
    vendorDescription: 'Seed vendor',
    vendorLogo: 'https://example.com/logo.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await userModel.create({
    _id: customerId,
    email: `customer_${Date.now()}@example.com`,
    phone: '9802222222',
    password: passwordHash,
    firstName: 'Customer',
    lastName: 'QA',
    role: 'CUSTOMER',
    permissions: {},
    isEmailVerified: true,
    isPhoneVerified: false,
    loyaltyPoints: 0,
    trustScore: 0,
    isBlocked: false,
    failedAttempts: 0,
    isFrozen: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed address
  await addressModel.deleteMany({ _id: addressId });
  await addressModel.create({
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed product
  await productModel.deleteMany({ _id: productId });
  await productModel.create({
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
    categoryId,
    brandId,
    vendorId,
    vendorName: 'Vendor QA',
    vendorEmail: `vendor_${Date.now()}@example.com`,
    suitableFor: ['NORMAL'],
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewProduct: false,
    metaTitle: 'Seed',
    metaDescription: 'Seed',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });




  return {
    vendorId,
    customerId,
    addressId,
    productId,
    vendorAccessToken: '',
    customerAccessToken: '',
  };
}

