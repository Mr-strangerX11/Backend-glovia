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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDiscountSettingsDto = exports.UpdateDeliverySettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UpdateDeliverySettingsDto {
}
exports.UpdateDeliverySettingsDto = UpdateDeliverySettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Free delivery threshold in NPR', example: 2999 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Free delivery threshold is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'freeDeliveryThreshold must be a number conforming to the specified constraints' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'freeDeliveryThreshold must not be less than 0' }),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "freeDeliveryThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valley delivery charge in NPR', example: 99 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Valley delivery charge is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'valleyDeliveryCharge must be a number conforming to the specified constraints' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'valleyDeliveryCharge must not be less than 0' }),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "valleyDeliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outside valley delivery charge in NPR', example: 149 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Outside valley delivery charge is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'outsideValleyDeliveryCharge must be a number conforming to the specified constraints' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'outsideValleyDeliveryCharge must not be less than 0' }),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "outsideValleyDeliveryCharge", void 0);
class UpdateDiscountSettingsDto {
}
exports.UpdateDiscountSettingsDto = UpdateDiscountSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable or disable discount', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], UpdateDiscountSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Discount percentage (0-100)', example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'percentage must be a number conforming to the specified constraints' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'percentage must not be less than 0' }),
    (0, class_validator_1.Max)(100, { message: 'percentage cannot exceed 100' }),
    __metadata("design:type", Number)
], UpdateDiscountSettingsDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Minimum order amount for discount in NPR', example: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'minOrderAmount must be a number conforming to the specified constraints' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'minOrderAmount must not be less than 0' }),
    __metadata("design:type", Number)
], UpdateDiscountSettingsDto.prototype, "minOrderAmount", void 0);
//# sourceMappingURL=settings.dto.js.map