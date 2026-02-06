import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailOtpDto } from './dto/auth.dto';
import { User, UserRole } from '../../database/schemas/user.schema';
import { OtpVerification } from '../../database/schemas/otp-verification.schema';
import { OtpService, EmailOtpService } from '../verification/otp.service';
export declare class AuthService {
    private userModel;
    private otpVerificationModel;
    private jwtService;
    private configService;
    private otpService;
    private emailOtpService;
    constructor(userModel: Model<User>, otpVerificationModel: Model<OtpVerification>, jwtService: JwtService, configService: ConfigService, otpService: OtpService, emailOtpService: EmailOtpService);
    register(dto: RegisterDto, ipAddress?: string, deviceFingerprint?: string): Promise<{
        message: string;
        userId: string;
        email: string;
        isEmailVerified: boolean;
    }>;
    login(dto: LoginDto, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            trustScore: number;
            isEmailVerified: true;
            isPhoneVerified: boolean;
        };
    }>;
    validateUser(email: string, password: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    generateTokens(userId: string, email: string, role: UserRole): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<{
        message: string;
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
}
