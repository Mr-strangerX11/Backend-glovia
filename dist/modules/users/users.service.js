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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const otp_service_1 = require("../verification/otp.service");
let UsersService = class UsersService {
    constructor(userModel, addressModel, orderModel, otpVerificationModel, otpService, emailOtpService) {
        this.userModel = userModel;
        this.addressModel = addressModel;
        this.orderModel = orderModel;
        this.otpVerificationModel = otpVerificationModel;
        this.otpService = otpService;
        this.emailOtpService = emailOtpService;
    }
    async updateUserPermissions(userId, permissions) {
        const user = await this.userModel.findByIdAndUpdate(userId, { permissions }, { new: true }).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getProfile(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('id email phone firstName lastName role skinType profileImage isEmailVerified isPhoneVerified createdAt')
            .lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const payload = {};
        if (dto.firstName !== undefined) {
            payload.firstName = dto.firstName.trim();
        }
        if (dto.lastName !== undefined) {
            payload.lastName = dto.lastName.trim();
        }
        if (dto.skinType !== undefined) {
            payload.skinType = dto.skinType;
        }
        if (dto.profileImage !== undefined) {
            payload.profileImage = dto.profileImage?.trim() || '';
        }
        if (dto.email !== undefined) {
            const normalizedEmail = dto.email.trim().toLowerCase();
            if (normalizedEmail !== (user.email || '').toLowerCase()) {
                const verifiedEmailChange = await this.otpVerificationModel
                    .findOne({
                    userId: new mongoose_2.Types.ObjectId(userId),
                    phone: normalizedEmail,
                    purpose: 'email_change',
                    isVerified: true,
                })
                    .sort({ updatedAt: -1 })
                    .lean();
                if (!verifiedEmailChange) {
                    throw new common_1.BadRequestException('Please verify your new email with OTP before saving');
                }
            }
            const duplicateEmail = await this.userModel
                .findOne({ email: normalizedEmail, _id: { $ne: userId } })
                .select('_id')
                .lean();
            if (duplicateEmail) {
                throw new common_1.BadRequestException('Email is already in use');
            }
            payload.email = normalizedEmail;
        }
        if (dto.phone !== undefined) {
            const normalizedPhone = dto.phone.trim();
            if (!normalizedPhone) {
                payload.phone = undefined;
            }
            else {
                const duplicatePhone = await this.userModel
                    .findOne({ phone: normalizedPhone, _id: { $ne: userId } })
                    .select('_id')
                    .lean();
                if (duplicatePhone) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
                payload.phone = normalizedPhone;
            }
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, payload, { new: true })
            .select('id email phone firstName lastName skinType profileImage')
            .lean();
        if (payload.email && payload.email !== (user.email || '').toLowerCase()) {
            await this.otpVerificationModel.deleteMany({
                userId: new mongoose_2.Types.ObjectId(userId),
                phone: payload.email,
                purpose: 'email_change',
            });
        }
        return updatedUser;
    }
    async sendEmailChangeOtp(userId, email) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            throw new common_1.BadRequestException('Email is required');
        }
        if (normalizedEmail === (user.email || '').toLowerCase()) {
            throw new common_1.BadRequestException('Please enter a different email');
        }
        const duplicateEmail = await this.userModel
            .findOne({ email: normalizedEmail, _id: { $ne: userId } })
            .select('_id')
            .lean();
        if (duplicateEmail) {
            throw new common_1.BadRequestException('Email is already in use');
        }
        const otp = this.otpService.generateOtp();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
        await this.otpVerificationModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            phone: normalizedEmail,
            otp,
            purpose: 'email_change',
            expiresAt,
        });
        const sent = await this.emailOtpService.sendEmailOtp(normalizedEmail, otp, 'email_verification');
        if (!sent) {
            throw new common_1.BadRequestException('Failed to send verification code to new email');
        }
        return {
            success: true,
            message: 'Verification code sent to your new email',
        };
    }
    async verifyEmailChangeOtp(userId, email, otp) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            throw new common_1.BadRequestException('Email is required');
        }
        const otpRecord = await this.otpVerificationModel
            .findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            phone: normalizedEmail,
            otp,
            purpose: 'email_change',
            isVerified: false,
            expiresAt: { $gt: new Date() },
        })
            .sort({ createdAt: -1 })
            .lean();
        if (!otpRecord) {
            const anyOtpRecord = await this.otpVerificationModel
                .findOne({
                userId: new mongoose_2.Types.ObjectId(userId),
                phone: normalizedEmail,
                purpose: 'email_change',
                isVerified: false,
                expiresAt: { $gt: new Date() },
            })
                .sort({ createdAt: -1 })
                .lean();
            if (anyOtpRecord) {
                await this.otpVerificationModel.findByIdAndUpdate(anyOtpRecord._id, { $inc: { attempts: 1 } }, { new: true });
                throw new common_1.BadRequestException('Wrong code. Please check your email and try again.');
            }
            throw new common_1.BadRequestException('Verification code expired. Please request a new code.');
        }
        if (otpRecord.attempts >= 5) {
            throw new common_1.BadRequestException('Too many failed attempts. Please request a new code.');
        }
        await this.otpVerificationModel.findByIdAndUpdate(otpRecord._id, { $set: { isVerified: true }, $inc: { attempts: 1 } }, { new: true });
        return {
            success: true,
            message: 'New email verified successfully. You can now save profile changes.',
            email: normalizedEmail,
        };
    }
    async getAddresses(userId) {
        return this.addressModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ isDefault: -1, createdAt: -1 })
            .lean();
    }
    async createAddress(userId, dto) {
        const addressCount = await this.addressModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) });
        const shouldSetDefault = dto.isDefault || addressCount === 0;
        if (shouldSetDefault) {
            await this.addressModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId) }, { isDefault: false });
        }
        return this.addressModel.create({
            ...dto,
            isDefault: shouldSetDefault,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
    }
    async updateAddress(userId, addressId, dto) {
        const address = await this.addressModel.findOne({
            _id: new mongoose_2.Types.ObjectId(addressId),
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        const makeDefault = dto.isDefault === true;
        if (makeDefault) {
            await this.addressModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId), _id: { $ne: new mongoose_2.Types.ObjectId(addressId) } }, { isDefault: false });
        }
        const updated = await this.addressModel
            .findByIdAndUpdate(addressId, {
            ...dto,
            isDefault: makeDefault ? true : dto.isDefault,
        }, { new: true })
            .lean();
        const defaultExists = await this.addressModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            isDefault: true,
        });
        if (!defaultExists) {
            await this.addressModel.findByIdAndUpdate(updated._id, { isDefault: true });
            return { ...updated, isDefault: true };
        }
        return updated;
    }
    async deleteAddress(userId, addressId) {
        const address = await this.addressModel.findOne({
            _id: new mongoose_2.Types.ObjectId(addressId),
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.addressModel.findByIdAndDelete(addressId);
        return { message: 'Address deleted successfully' };
    }
    async createAddressWithGeo(userId, dto) {
        const addressCount = await this.addressModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) });
        const isFirstAddress = addressCount === 0;
        const isVerified = !!(dto.latitude && dto.longitude);
        const address = await this.addressModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            fullName: dto.fullName,
            phone: dto.phone,
            province: dto.province,
            district: dto.district,
            municipality: dto.municipality,
            wardNo: dto.wardNo,
            area: dto.area,
            landmark: dto.landmark,
            latitude: dto.latitude ? Number(dto.latitude) : null,
            longitude: dto.longitude ? Number(dto.longitude) : null,
            isVerified,
            isDefault: isFirstAddress,
        });
        if (isVerified) {
            await this.userModel.findByIdAndUpdate(userId, {
                $inc: { trustScore: 20 },
            });
        }
        return address;
    }
    async getOrderHistory(userId) {
        return this.orderModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate({
            path: 'items',
            populate: {
                path: 'productId',
                select: 'id name slug',
            },
        })
            .populate('addressId')
            .sort({ createdAt: -1 })
            .lean();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)('Address')),
    __param(2, (0, mongoose_1.InjectModel)('Order')),
    __param(3, (0, mongoose_1.InjectModel)('OtpVerification')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        otp_service_1.OtpService,
        otp_service_1.EmailOtpService])
], UsersService);
//# sourceMappingURL=users.service.js.map