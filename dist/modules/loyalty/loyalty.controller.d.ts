import { Model } from 'mongoose';
import { User, UserRole } from '../../database/schemas';
export declare class LoyaltyController {
    private readonly userModel;
    constructor(userModel: Model<User>);
    getAllLoyaltyPoints(): Promise<{
        userId: string;
        firstName: any;
        lastName: any;
        email: any;
        role: any;
        points: number;
    }[]>;
    getMyLoyalty(userId: string): Promise<{
        userId: string;
        points: number;
    }>;
    getLoyalty(userId: string, currentUserId: string, currentUserRole: UserRole): Promise<{
        userId: string;
        points: number;
    }>;
    addPoints(body: {
        userId: string;
        points: number;
    }): Promise<{
        userId: string;
        points: number;
    }>;
}
