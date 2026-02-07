import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, Product, ProductImage, ProductCategory } from '../../database/schemas';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('ProductImage') private productImageModel: Model<ProductImage>,
  ) {}

  async findAll() {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    const categoryIds = categories.map((category) => category._id);

    const [children, productCounts] = await Promise.all([
      this.categoryModel
        .find({
          parentId: { $in: categoryIds },
          isActive: true,
        })
        .sort({ displayOrder: 1 })
        .lean(),
      this.productModel
        .aggregate([
          {
            $match: {
              isActive: true,
              categoryId: { $in: categoryIds },
            },
          },
          {
            $group: {
              _id: '$categoryId',
              count: { $sum: 1 },
            },
          },
        ]),
    ]);

    const childrenByParentId = children.reduce<Record<string, any[]>>((acc, child) => {
      const key = child.parentId?.toString();
      if (!key) {
        return acc;
      }
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(child);
      return acc;
    }, {});

    const countsByCategoryId = productCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    return categories.map((category) => ({
      ...category,
      children: childrenByParentId[category._id.toString()] || [],
      _count: { products: countsByCategoryId[category._id.toString()] || 0 },
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .lean();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const [children, products] = await Promise.all([
      this.categoryModel
        .find({ parentId: new Types.ObjectId(category._id), isActive: true })
        .sort({ displayOrder: 1 })
        .lean(),
      this.productModel
        .find({ categoryId: new Types.ObjectId(category._id), isActive: true })
        .limit(12)
        .lean(),
    ]);

    const productIds = products.map((product) => product._id);
    const images = await this.productImageModel
      .find({ productId: { $in: productIds } })
      .sort({ displayOrder: 1 })
      .lean();

    const firstImageByProductId = images.reduce<Record<string, any>>((acc, image) => {
      const key = image.productId.toString();
      if (!acc[key]) {
        acc[key] = image;
      }
      return acc;
    }, {});

    const productsWithImages = products.map((product) => ({
      ...product,
      images: firstImageByProductId[product._id.toString()]
        ? [firstImageByProductId[product._id.toString()]]
        : [],
    }));

    return {
      ...category,
      children,
      products: productsWithImages,
    };
  }

  async create(dto: any) {
    const category = await this.categoryModel.create(dto);
    return category;
  }

  async update(id: string, dto: any) {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }

  async seedInitialCategories() {
    const existingCount = await this.categoryModel.countDocuments();
    if (existingCount > 0) {
      return { message: 'Categories already exist', count: existingCount };
    }

    const categories = [
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Skincare products for healthy and glowing skin',
        type: ProductCategory.SKINCARE,
        displayOrder: 1,
      },
      {
        name: 'Haircare',
        slug: 'haircare',
        description: 'Haircare products for beautiful and healthy hair',
        type: ProductCategory.HAIRCARE,
        displayOrder: 2,
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Makeup products for all your beauty needs',
        type: ProductCategory.MAKEUP,
        displayOrder: 3,
      },
      {
        name: 'Organic',
        slug: 'organic',
        description: 'Natural and organic beauty products',
        type: ProductCategory.ORGANIC,
        displayOrder: 4,
      },
      {
        name: 'Herbal',
        slug: 'herbal',
        description: 'Herbal beauty products with natural ingredients',
        type: ProductCategory.HERBAL,
        displayOrder: 5,
      },
    ];

    const created = await this.categoryModel.insertMany(categories);
    return { message: 'Categories seeded successfully', count: created.length, categories: created };
  }
}
