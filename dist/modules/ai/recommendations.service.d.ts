import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../database/schemas/product.schema';
type ProductLean = Omit<Product, keyof Document> & {
    _id: string | Types.ObjectId;
    categoryId: string | Types.ObjectId;
    isActive: boolean;
    isBestSeller?: boolean;
};
export declare class RecommendationsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    getRecommendations(userId?: string, productId?: string): Promise<ProductLean[]>;
}
export {};
