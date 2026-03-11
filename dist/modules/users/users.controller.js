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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const users_dto_1 = require("./dto/users.dto");
const add_address_geo_dto_1 = require("./dto/add-address-geo.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(userId) {
        return this.usersService.getProfile(userId);
    }
    updateProfile(userId, dto) {
        return this.usersService.updateProfile(userId, dto);
    }
    sendEmailChangeOtp(userId, dto) {
        return this.usersService.sendEmailChangeOtp(userId, dto.email);
    }
    verifyEmailChangeOtp(userId, dto) {
        return this.usersService.verifyEmailChangeOtp(userId, dto.email, dto.otp);
    }
    getAddresses(userId) {
        return this.usersService.getAddresses(userId);
    }
    createAddress(userId, dto) {
        return this.usersService.createAddress(userId, dto);
    }
    createAddressWithGeo(userId, dto) {
        return this.usersService.createAddressWithGeo(userId, dto);
    }
    updateAddress(userId, addressId, dto) {
        return this.usersService.updateAddress(userId, addressId, dto);
    }
    deleteAddress(userId, addressId) {
        return this.usersService.deleteAddress(userId, addressId);
    }
    getOrderHistory(userId) {
        return this.usersService.getOrderHistory(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile/email-change/send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP to new email for profile email change' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.SendEmailChangeOtpDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "sendEmailChangeOtp", null);
__decorate([
    (0, common_1.Post)('profile/email-change/verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP for profile email change' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.VerifyEmailChangeOtpDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "verifyEmailChangeOtp", null);
__decorate([
    (0, common_1.Get)('addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user addresses' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAddresses", null);
__decorate([
    (0, common_1.Post)('addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.CreateAddressDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createAddress", null);
__decorate([
    (0, common_1.Post)('addresses/geo'),
    (0, swagger_1.ApiOperation)({ summary: 'Create address with geo-coordinates (auto-verified)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_address_geo_dto_1.AddAddressWithGeoDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createAddressWithGeo", null);
__decorate([
    (0, common_1.Put)('addresses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, users_dto_1.UpdateAddressDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('addresses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getOrderHistory", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map