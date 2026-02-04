import { PrismaClient, UserRole, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@glovia.com.np' },
    update: {},
    create: {
      email: 'admin@glovia.com.np',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+9779800000000',
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Complete skincare essentials for glowing skin',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
        type: 'SKINCARE',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'makeup' },
      update: {},
      create: {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Professional makeup products',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
        type: 'MAKEUP',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'suncare' },
      update: {},
      create: {
        name: 'Sun Care',
        slug: 'suncare',
        description: 'Protection from harmful UV rays',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
        type: 'SKINCARE',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'haircare' },
      update: {},
      create: {
        name: 'Hair Care',
        slug: 'haircare',
        description: 'Nourish and strengthen your hair',
        image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da',
        type: 'HAIRCARE',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'cosrx' },
      update: {},
      create: {
        name: 'COSRX',
        slug: 'cosrx',
        description: 'Korean beauty brand focused on simple, effective skincare',
        logo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'innisfree' },
      update: {},
      create: {
        name: 'Innisfree',
        slug: 'innisfree',
        description: 'Natural beauty from Jeju Island',
        logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'laneige' },
      update: {},
      create: {
        name: 'Laneige',
        slug: 'laneige',
        description: 'Premium Korean skincare and cosmetics',
        logo: 'https://images.unsplash.com/photo-1556228852-80f3f9ea0f6b',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Brands created:', brands.length);

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'cosrx-snail-mucin-essence' },
      update: {},
      create: {
        name: 'COSRX Advanced Snail 96 Mucin Power Essence',
        slug: 'cosrx-snail-mucin-essence',
        description: 'Lightweight essence that absorbs quickly to deliver instant hydration and rejuvenation. Contains 96.3% snail secretion filtrate.',
        price: 2500,
        compareAtPrice: 3000,
        stockQuantity: 50,
        sku: 'COSRX-001',
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        suitableFor: ['DRY', 'NORMAL', 'COMBINATION'],
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
              altText: 'COSRX Snail Mucin Essence',
              displayOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'innisfree-green-tea-seed-serum' },
      update: {},
      create: {
        name: 'Innisfree Green Tea Seed Serum',
        slug: 'innisfree-green-tea-seed-serum',
        description: 'A fresh lightweight serum enriched with green tea from Jeju Island that deeply hydrates and revitalizes skin.',
        price: 2200,
        compareAtPrice: 2800,
        stockQuantity: 35,
        sku: 'INNIS-001',
        categoryId: categories[0].id,
        brandId: brands[1].id,
        isActive: true,
        isFeatured: true,
        suitableFor: ['NORMAL', 'COMBINATION'],
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908',
              altText: 'Innisfree Green Tea Serum',
              displayOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'laneige-water-sleeping-mask' },
      update: {},
      create: {
        name: 'Laneige Water Sleeping Mask',
        slug: 'laneige-water-sleeping-mask',
        description: 'Overnight mask that hydrates and purifies skin while you sleep. Wake up to soft, glowing, and well-rested skin.',
        price: 3200,
        compareAtPrice: 4000,
        stockQuantity: 25,
        sku: 'LANEIGE-001',
        categoryId: categories[0].id,
        brandId: brands[2].id,
        isActive: true,
        isFeatured: true,
        suitableFor: ['DRY', 'NORMAL', 'COMBINATION'],
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b',
              altText: 'Laneige Water Sleeping Mask',
              displayOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'cosrx-low-ph-cleanser' },
      update: {},
      create: {
        name: 'COSRX Low pH Good Morning Gel Cleanser',
        slug: 'cosrx-low-ph-cleanser',
        description: 'Gentle gel cleanser with a low pH to maintain skin\'s natural barrier. Perfect for morning cleansing routine.',
        price: 1800,
        stockQuantity: 60,
        sku: 'COSRX-002',
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        suitableFor: ['OILY', 'COMBINATION'],
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1582719478167-2cf4b7660fdb?auto=format&fit=crop&w=1600&q=80',
              altText: 'COSRX Low pH Cleanser',
              displayOrder: 0,
            },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Products created:', products.length);

  // Create banners
  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: 'banner-1' },
      update: {},
      create: {
        id: 'banner-1',
        title: 'New Arrivals',
        subtitle: 'Discover the latest K-Beauty products',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
        link: '/products?filter=new',
        displayOrder: 0,
        isActive: true,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-2' },
      update: {},
      create: {
        id: 'banner-2',
        title: 'Summer Sale',
        subtitle: 'Up to 30% off on selected items',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
        link: '/products?filter=sale',
        displayOrder: 1,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Banners created:', banners.length);

  // Create blog posts
  const blogs = await Promise.all([
    prisma.blog.upsert({
      where: { slug: 'korean-skincare-routine' },
      update: {},
      create: {
        title: '10-Step Korean Skincare Routine Explained',
        slug: 'korean-skincare-routine',
        excerpt: 'Learn about the famous 10-step Korean skincare routine and how to adapt it for your skin type.',
        content: `
# The 10-Step Korean Skincare Routine

Korean skincare has taken the beauty world by storm. Here's a complete guide to the famous 10-step routine:

## 1. Oil-based Cleanser
Remove makeup and sunscreen with an oil-based cleanser.

## 2. Water-based Cleanser
Follow up with a gentle water-based cleanser.

## 3. Exfoliator
Use 2-3 times per week to remove dead skin cells.

## 4. Toner
Balance your skin's pH levels.

## 5. Essence
The heart of Korean skincare - hydrates and prepares skin.

And so on...
        `,
        featuredImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
        authorName: admin.firstName + ' ' + admin.lastName,
        tags: ['skincare', 'k-beauty', 'routine'],
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
  ]);
  console.log('✅ Blog posts created:', blogs.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Admin credentials:');
  console.log('   Email: admin@glovia.com.np');
  console.log('   Password: admin123');
  console.log('\n⚠️  Remember to change the admin password in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
