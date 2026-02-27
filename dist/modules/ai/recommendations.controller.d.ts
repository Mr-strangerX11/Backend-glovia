import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(userId: string, productId: string): Promise<(Omit<import("../../database/schemas").Product, keyof Document> & {
        _id: string | import("mongoose").Types.ObjectId;
        categoryId: string | import("mongoose").Types.ObjectId;
        isActive: boolean;
        isBestSeller?: boolean;
    })[]>;
}
