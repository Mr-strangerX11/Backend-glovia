import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/reviews.dto';
import { Review } from '../../database/schemas/review.schema';
import { Product } from '../../database/schemas/product.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { Order } from '../../database/schemas/order.schema';
import { User } from '../../database/schemas/user.schema';
export declare class ReviewsService {
    private reviewModel;
    private productModel;
    private orderItemModel;
    private orderModel;
    private userModel;
    constructor(reviewModel: Model<Review>, productModel: Model<Product>, orderItemModel: Model<OrderItem>, orderModel: Model<Order>, userModel: Model<User>);
    create(userId: string, dto: CreateReviewDto): Promise<{
        approved: boolean;
        user: User & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        productId: Types.ObjectId;
        userId: Types.ObjectId;
        rating: number;
        title?: string;
        comment: string;
        isVerified: boolean;
        isApproved: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    findByProduct(productId: string): Promise<{
        approved: boolean;
        user: any;
        productId: Types.ObjectId;
        userId: Types.ObjectId;
        rating: number;
        title?: string;
        comment: string;
        isVerified: boolean;
        isApproved: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
}
