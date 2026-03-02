import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviews.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    create(userId: string, dto: CreateReviewDto): Promise<{
        approved: boolean;
        user: import("../../database/schemas").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        productId: import("mongoose").Types.ObjectId;
        userId: import("mongoose").Types.ObjectId;
        rating: number;
        title?: string;
        comment: string;
        isVerified: boolean;
        isApproved: boolean;
        _id: import("mongoose").Types.ObjectId;
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
        productId: import("mongoose").Types.ObjectId;
        userId: import("mongoose").Types.ObjectId;
        rating: number;
        title?: string;
        comment: string;
        isVerified: boolean;
        isApproved: boolean;
        _id: import("mongoose").Types.ObjectId;
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
