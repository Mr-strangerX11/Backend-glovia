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
exports.TrustScoreGuard = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
let TrustScoreGuard = class TrustScoreGuard {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        console.log('TrustScoreGuard: user in request:', user);
        if (!user || !user.id) {
            console.log('TrustScoreGuard: No user or user.id found, rejecting with Authentication required');
            throw new common_1.ForbiddenException('Authentication required');
        }
        const userRecord = await this.userModel.findById(new mongoose_2.Types.ObjectId(user.id))
            .select('trustScore isEmailVerified isPhoneVerified isBlocked')
            .lean();
        if (!userRecord) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (userRecord.isBlocked) {
            throw new common_1.ForbiddenException('Account blocked. Contact support.');
        }
        if (userRecord.trustScore < 60) {
            const missing = [];
            if (!userRecord.isEmailVerified)
                missing.push('email verification');
            if (!userRecord.isPhoneVerified)
                missing.push('phone verification');
            throw new common_1.ForbiddenException({
                message: 'Insufficient verification to place orders',
                trustScore: userRecord.trustScore,
                required: 60,
                missing,
                hint: 'Complete email and phone verification to proceed',
            });
        }
        return true;
    }
};
exports.TrustScoreGuard = TrustScoreGuard;
exports.TrustScoreGuard = TrustScoreGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TrustScoreGuard);
//# sourceMappingURL=trust-score.guard.js.map