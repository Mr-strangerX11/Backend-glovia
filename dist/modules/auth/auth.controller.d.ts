import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailOtpDto } from './dto/auth.dto';
import { Request } from 'express';
import { UserRole } from '../../database/schemas/user.schema';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request): Promise<{
        success: boolean;
        message: string;
        nextStep: string;
        userId: string;
        email: string;
        isEmailVerified: boolean;
    }>;
    verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<{
        message: string;
        success: boolean;
        user?: any;
        accessToken?: string;
        refreshToken?: string;
    }>;
    resendVerificationOtp(dto: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, req: Request): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<any>;
    getEmailHealth(user: any): Promise<{
        nodeEnv: string;
        configuredProvider: string;
        providerSequence: ("mock" | "smtp" | "sendgrid" | "ses")[];
        allowMockFallback: boolean;
        smtp: {
            configured: boolean;
            hostConfigured: boolean;
            port: number;
            secure: boolean;
            usernameConfigured: boolean;
            passwordConfigured: boolean;
            fromEmailConfigured: boolean;
            verified: boolean;
            verifyError: string;
        };
        sendgrid: {
            configured: boolean;
            fromEmailConfigured: boolean;
        };
        canAttemptRealDelivery: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
