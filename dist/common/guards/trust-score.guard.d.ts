import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
export declare class TrustScoreGuard implements CanActivate {
    private userModel;
    constructor(userModel: Model<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
