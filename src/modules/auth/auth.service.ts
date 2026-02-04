import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailOtpDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';
import { OtpService, EmailOtpService } from '../verification/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private emailOtpService: EmailOtpService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, deviceFingerprint?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phone: dto.phone },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.CUSTOMER,
        ipAddress,
        deviceFingerprint,
        isEmailVerified: false, // Not verified yet
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        trustScore: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    // Generate and send email OTP
    const otp = this.otpService.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        userId: user.id,
        phone: user.email, // Use email field as identifier for email OTP
        otp,
        purpose: 'email_verification',
        expiresAt,
      },
    });

    const sent = await this.emailOtpService.sendEmailOtp(user.email, otp, 'email_verification');
    if (!sent) {
      throw new BadRequestException('Failed to send verification email');
    }

    // Return message without tokens until email is verified
    return {
      message: 'Registration successful. Please verify your email to complete signup.',
      userId: user.id,
      email: user.email,
      isEmailVerified: false,
    };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.validateUser(dto.email, dto.password);

    // Block login if email not verified
    if (!user.isEmailVerified) {
      throw new ForbiddenException('Please verify your email before logging in. Check your inbox for verification code.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ipAddress,
        failedAttempts: 0,
      },
    });
    
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account blocked. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed attempts
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: { increment: 1 } },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Forgot password: generate OTP for password reset via email
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = dto;

    if (!email) {
      throw new BadRequestException('Provide email');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const otp = this.otpService.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        userId: user.id,
        phone: email, // reuse phone field as identifier for email OTPs
        otp,
        purpose: 'password_reset',
        expiresAt,
      },
    });

    const sent = await this.emailOtpService.sendEmailOtp(email, otp, 'password_reset');
    if (!sent) {
      throw new BadRequestException('Failed to send password reset email');
    }

    return { message: 'Password reset OTP sent to your email' };
  }

  /**
   * Reset password using email + OTP
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        userId: user.id,
        phone: email, // stored under phone field
        otp,
        purpose: 'password_reset',
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= 5) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          refreshToken: null,
          failedAttempts: 0,
        },
      }),
      this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isVerified: true, attempts: { increment: 1 } },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify email OTP after registration
   * Must be verified before user can login
   */
  async verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<{ message: string; user: any; accessToken: string; refreshToken: string }> {
    const { email, otp } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find matching email OTP
    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        userId: user.id,
        phone: email, // Stored as phone field for email OTP
        otp,
        purpose: 'email_verification',
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (otpRecord.attempts >= 5) {
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }

    // Mark OTP as verified and mark email as verified
    await this.prisma.$transaction([
      this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isVerified: true, attempts: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          trustScore: { increment: 20 }, // Reward for email verification
        },
      }),
    ]);

    // Generate tokens and allow access
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: true,
        trustScore: user.trustScore + 20,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
