import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../database/schemas/product.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getRecommendations(userId?: string, productId?: string) {
    // If productId is provided, get similar products
    if (productId && Types.ObjectId.isValid(productId)) {
      const product = await this.productModel.findById(productId).lean();
      if (product) {
        // Get products in the same category, excluding the current product
        const similarProducts = await this.productModel
          .find({
            categoryId: product.categoryId,
            _id: { $ne: product._id },
            isActive: true,
          })
          .limit(6)
          .lean();
        
        if (similarProducts.length > 0) {
          return similarProducts;
        }
      }
    }

    // Default: get popular/best seller products
    const popularProducts = await this.productModel
      .find({ isActive: true, isBestSeller: true })
      .limit(6)
      .lean();

    if (popularProducts.length > 0) {
      return popularProducts;
    }

    // Fallback: get any active products
    return this.productModel
      .find({ isActive: true })
      .limit(6)
      .lean();
  }
}

