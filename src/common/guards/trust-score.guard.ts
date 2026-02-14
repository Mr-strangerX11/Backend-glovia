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
    console.log('=== TrustScoreGuard ENTERED ===');
    console.log('TrustScoreGuard: user in request:', JSON.stringify(user));

    if (!user || !user.id) {
      console.log('TrustScoreGuard: No user or user.id found, rejecting with Authentication required');
      throw new ForbiddenException('Authentication required');
    }

    try {
      const userRecord = await this.userModel.findById(new Types.ObjectId(user.id))
        .select('trustScore isEmailVerified isPhoneVerified isBlocked')
        .lean();

      console.log('TrustScoreGuard: userRecord from DB:', JSON.stringify(userRecord));

      if (!userRecord) {
        console.log('TrustScoreGuard: User not found in database');
        throw new ForbiddenException('User not found');
      }

      if (userRecord.isBlocked) {
        console.log('TrustScoreGuard: User is blocked');
        throw new ForbiddenException('Account blocked. Contact support.');
      }

      // Temporarily relaxed: only require email verification
      if (!userRecord.isEmailVerified) {
        console.log('TrustScoreGuard: Email not verified, user:', userRecord);
        throw new ForbiddenException({
          message: 'Email verification required to place orders',
          hint: 'Please verify your email address to proceed',
        });
      }

      console.log('TrustScoreGuard: ✅ All checks passed, allowing request');
      return true;
    } catch (error) {
      console.error('TrustScoreGuard: ERROR occurred:', error);
      throw error;
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
