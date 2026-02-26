export declare class RecommendationsController {
    getRecommendations(userId: string, productId: string): {
        id: string;
        name: string;
        price: number;
    }[];
}
