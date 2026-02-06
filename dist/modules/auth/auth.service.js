"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const otp_verification_schema_1 = require("../../database/schemas/otp-verification.schema");
const otp_service_1 = require("../verification/otp.service");
let AuthService = class AuthService {
    constructor(userModel, otpVerificationModel, jwtService, configService, otpService, emailOtpService) {
        this.userModel = userModel;
        this.otpVerificationModel = otpVerificationModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpService = otpService;
        this.emailOtpService = emailOtpService;
    }
    async register(dto, ipAddress, deviceFingerprint) {
        const existingUser = await this.userModel.findOne({
            $or: [{ email: dto.email }, { phone: dto.phone }],
        }).lean();
        if (existingUser) {
            throw new common_1.ConflictException('Email or phone already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.userModel.create({
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: user_schema_1.UserRole.CUSTOMER,
            ipAddress,
            deviceFingerprint,
            isEmailVerified: false,
        });
        const otp = this.otpService.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.otpVerificationModel.create({
            userId: user._id,
            phone: user.email,
            otp,
            purpose: 'email_verification',
            expiresAt,
        });
        const sent = await this.emailOtpService.sendEmailOtp(user.email, otp, 'email_verification');
        if (!sent) {
            throw new common_1.BadRequestException('Failed to send verification email');
        }
        return {
            message: 'Registration successful. Please verify your email to complete signup.',
            userId: user._id.toString(),
            email: user.email,
            isEmailVerified: false,
        };
    }
    async login(dto, ipAddress) {
        const user = await this.validateUser(dto.email, dto.password);
        if (!user.isEmailVerified) {
            throw new common_1.ForbiddenException('Please verify your email before logging in. Check your inbox for verification code.');
        }
        await this.userModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
            ipAddress,
            failedAttempts: 0,
        }, { new: true });
        const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                trustScore: user.trustScore,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
            },
            ...tokens,
        };
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.isBlocked) {
            throw new common_1.UnauthorizedException('Account blocked. Contact support.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await this.userModel.findByIdAndUpdate(user._id, { $inc: { failedAttempts: 1 } }, { new: true });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken }, { new: true });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.userModel.findById(new mongoose_2.Types.ObjectId(userId)).lean();
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
    }
    async forgotPassword(dto) {
        const { email } = dto;
        if (!email) {
            throw new common_1.BadRequestException('Provide email');
        }
        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new common_1.NotFoundException('User with this email not found');
        }
        const otp = this.otpService.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.otpVerificationModel.create({
            userId: user._id,
            phone: email,
            otp,
            purpose: 'password_reset',
            expiresAt,
        });
        const sent = await this.emailOtpService.sendEmailOtp(email, otp, 'password_reset');
        if (!sent) {
            throw new common_1.BadRequestException('Failed to send password reset email');
        }
        return { message: 'Password reset OTP sent to your email' };
    }
    async resetPassword(dto) {
        const { email, otp, newPassword } = dto;
        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otpRecord = await this.otpVerificationModel.findOne({
            userId: user._id,
            phone: email,
            otp,
            purpose: 'password_reset',
            isVerified: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 }).lean();
        if (!otpRecord) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (otpRecord.attempts >= 5) {
            throw new common_1.BadRequestException('Maximum attempts exceeded');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            refreshToken: null,
            failedAttempts: 0,
        }, { new: true });
        await this.otpVerificationModel.findByIdAndUpdate(otpRecord._id, { $set: { isVerified: true }, $inc: { attempts: 1 } }, { new: true });
        return { message: 'Password reset successfully' };
    }
    async verifyEmailOtp(dto) {
        const { email, otp } = dto;
        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otpRecord = await this.otpVerificationModel.findOne({
            userId: user._id,
            phone: email,
            otp,
            purpose: 'email_verification',
            isVerified: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 }).lean();
        if (!otpRecord) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        if (otpRecord.attempts >= 5) {
            throw new common_1.BadRequestException('Too many failed attempts. Please request a new code.');
        }
        await this.otpVerificationModel.findByIdAndUpdate(otpRecord._id, { $set: { isVerified: true }, $inc: { attempts: 1 } }, { new: true });
        const updatedUser = await this.userModel.findByIdAndUpdate(user._id, { isEmailVerified: true, $inc: { trustScore: 20 } }, { new: true }).lean();
        const tokens = await this.generateTokens(updatedUser._id.toString(), updatedUser.email, updatedUser.role);
        await this.updateRefreshToken(updatedUser._id.toString(), tokens.refreshToken);
        return {
            message: 'Email verified successfully',
            user: {
                id: updatedUser._id.toString(),
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                isEmailVerified: true,
                trustScore: updatedUser.trustScore,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(otp_verification_schema_1.OtpVerification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService,
        otp_service_1.EmailOtpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map