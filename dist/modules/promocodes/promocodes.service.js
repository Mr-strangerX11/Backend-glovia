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
exports.PromoCodesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const coupon_schema_1 = require("../../database/schemas/coupon.schema");
let PromoCodesService = class PromoCodesService {
    constructor(couponModel) {
        this.couponModel = couponModel;
    }
    async create(dto) {
        const payload = this.mapCouponPayload(dto);
        return this.couponModel.create(payload);
    }
    async findAll() {
        const now = new Date();
        return this.couponModel
            .find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
        })
            .sort({ createdAt: -1 })
            .lean();
    }
    async findAllForAdmin() {
        return this.couponModel.find().sort({ createdAt: -1 }).lean();
    }
    async findByCode(code) {
        const normalizedCode = (code || '').trim().toUpperCase();
        const promo = await this.couponModel.findOne({ code: normalizedCode, isActive: true }).lean();
        if (!promo)
            throw new common_1.NotFoundException('Promo code not found');
        const now = new Date();
        if (promo.validFrom && now < new Date(promo.validFrom)) {
            throw new common_1.BadRequestException('Promo code is not active yet');
        }
        if (promo.validUntil && now > new Date(promo.validUntil)) {
            throw new common_1.BadRequestException('Promo code has expired');
        }
        return promo;
    }
    async update(id, dto) {
        const payload = this.mapCouponPayload(dto, true);
        return this.couponModel.findByIdAndUpdate(id, payload, { new: true });
    }
    async remove(id) {
        return this.couponModel.findByIdAndDelete(id);
    }
    mapCouponPayload(dto, isPartial = false) {
        const payload = {};
        if (!isPartial || dto.code !== undefined) {
            payload.code = String(dto.code || '').trim().toUpperCase();
        }
        if (!isPartial || dto.description !== undefined) {
            payload.description = dto.description || undefined;
        }
        const discountType = dto.discountType || (dto.discountPercentage !== undefined ? 'PERCENTAGE' : undefined);
        if (!isPartial || discountType !== undefined) {
            payload.discountType = discountType;
        }
        const discountValue = dto.discountValue ?? dto.discountPercentage;
        if (!isPartial || discountValue !== undefined) {
            payload.discountValue = this.toNumber(discountValue, 'discountValue');
        }
        if (!isPartial || dto.minOrderAmount !== undefined) {
            payload.minOrderAmount = dto.minOrderAmount !== undefined
                ? this.toNumber(dto.minOrderAmount, 'minOrderAmount')
                : undefined;
        }
        if (!isPartial || dto.maxDiscount !== undefined) {
            payload.maxDiscount = dto.maxDiscount !== undefined
                ? this.toNumber(dto.maxDiscount, 'maxDiscount')
                : undefined;
        }
        if (!isPartial || dto.usageLimit !== undefined) {
            payload.usageLimit = dto.usageLimit !== undefined
                ? this.toNumber(dto.usageLimit, 'usageLimit')
                : undefined;
        }
        if (!isPartial || dto.isActive !== undefined) {
            payload.isActive = dto.isActive !== undefined ? Boolean(dto.isActive) : true;
        }
        const validFrom = dto.validFrom;
        const validUntil = dto.validUntil ?? dto.expiresAt;
        if (!isPartial || validFrom !== undefined) {
            payload.validFrom = validFrom ? this.toDate(validFrom, 'validFrom') : new Date();
        }
        if (!isPartial || validUntil !== undefined) {
            payload.validUntil = validUntil
                ? this.toDate(validUntil, 'validUntil')
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        if (payload.validFrom && payload.validUntil && payload.validFrom > payload.validUntil) {
            throw new common_1.BadRequestException('validUntil must be greater than validFrom');
        }
        return payload;
    }
    toNumber(value, field) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException(`${field} must be a valid number`);
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException(`${field} cannot be negative`);
        }
        return parsed;
    }
    toDate(value, field) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException(`${field} must be a valid date`);
        }
        return parsed;
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(coupon_schema_1.Coupon.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PromoCodesService);
//# sourceMappingURL=promocodes.service.js.map