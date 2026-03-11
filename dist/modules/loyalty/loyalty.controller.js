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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const schemas_1 = require("../../database/schemas");
let LoyaltyController = class LoyaltyController {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async getAllLoyaltyPoints() {
        const users = await this.userModel
            .find({}, { firstName: 1, lastName: 1, email: 1, role: 1, loyaltyPoints: 1 })
            .sort({ loyaltyPoints: -1, createdAt: -1 })
            .lean();
        return users.map((user) => ({
            userId: String(user._id),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            points: Number(user.loyaltyPoints || 0),
        }));
    }
    async getMyLoyalty(userId) {
        const user = await this.userModel.findById(userId, { loyaltyPoints: 1 }).lean();
        return { userId, points: Number(user?.loyaltyPoints || 0) };
    }
    async getLoyalty(userId, currentUserId, currentUserRole) {
        const isAdmin = currentUserRole === schemas_1.UserRole.ADMIN || currentUserRole === schemas_1.UserRole.SUPER_ADMIN;
        if (!isAdmin && currentUserId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own loyalty points');
        }
        const user = await this.userModel.findById(userId, { loyaltyPoints: 1 }).lean();
        return { userId, points: Number(user?.loyaltyPoints || 0) };
    }
    async addPoints(body) {
        if (!mongoose_2.Types.ObjectId.isValid(body.userId)) {
            throw new common_1.BadRequestException('Invalid user id');
        }
        const pointsToAdd = Number(body.points || 0);
        if (!Number.isFinite(pointsToAdd)) {
            throw new common_1.BadRequestException('Invalid points value');
        }
        const user = await this.userModel
            .findByIdAndUpdate(body.userId, { $inc: { loyaltyPoints: pointsToAdd } }, { new: true, projection: { loyaltyPoints: 1 } })
            .lean();
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return { userId: body.userId, points: Number(user.loyaltyPoints || 0) };
    }
};
exports.LoyaltyController = LoyaltyController;
__decorate([
    (0, common_1.Get)('admin/points'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(schemas_1.UserRole.ADMIN, schemas_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getAllLoyaltyPoints", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getMyLoyalty", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getLoyalty", null);
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(schemas_1.UserRole.ADMIN, schemas_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "addPoints", null);
exports.LoyaltyController = LoyaltyController = __decorate([
    (0, common_1.Controller)('loyalty'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LoyaltyController);
//# sourceMappingURL=loyalty.controller.js.map