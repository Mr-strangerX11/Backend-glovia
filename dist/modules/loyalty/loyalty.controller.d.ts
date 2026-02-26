export declare class LoyaltyController {
    getLoyalty(userId: string): {
        userId: string;
        points: number;
    };
    addPoints(body: {
        userId: string;
        points: number;
    }): {
        userId: string;
        points: number;
    };
}
