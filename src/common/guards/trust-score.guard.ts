import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class TrustScoreGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug logging
    console.log('TrustScoreGuard: user in request:', user);

    if (!user || !user.id) {
      console.log('TrustScoreGuard: No user or user.id found, rejecting with Authentication required');
      throw new ForbiddenException('Authentication required');
    }

    const userRecord = await this.userModel.findById(new Types.ObjectId(user.id))
      .select('trustScore isEmailVerified isPhoneVerified isBlocked')
      .lean();

    if (!userRecord) {
      throw new ForbiddenException('User not found');
    }

    if (userRecord.isBlocked) {
      throw new ForbiddenException('Account blocked. Contact support.');
    }

    // Temporarily relaxed: only require email verification
    if (!userRecord.isEmailVerified) {
      throw new ForbiddenException({
        message: 'Email verification required to place orders',
        hint: 'Please verify your email address to proceed',
      });
    }

    // Phone verification check disabled for now
    // if (userRecord.trustScore < 60) {
    //   const missing = [];
    //   if (!userRecord.isEmailVerified) missing.push('email verification');
    //   if (!userRecord.isPhoneVerified) missing.push('phone verification');

    //   throw new ForbiddenException({
    //     message: 'Insufficient verification to place orders',
    //     trustScore: userRecord.trustScore,
    //     required: 60,
    //     missing,
    //     hint: 'Complete email and phone verification to proceed',
    //   });
    // }

    return true;
  }
}
