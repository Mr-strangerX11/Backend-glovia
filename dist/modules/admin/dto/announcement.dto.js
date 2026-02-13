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
exports.UpdateAnnouncementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateAnnouncementDto {
}
exports.UpdateAnnouncementDto = UpdateAnnouncementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAnnouncementDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAnnouncementDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '🚚 Express Delivery: We deliver within 60 minutes!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '🚚 Express Delivery: We deliver within 60 minutes!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '🚚' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '#0066CC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(7),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(7),
    __metadata("design:type", String)
], UpdateAnnouncementDto.prototype, "textColor", void 0);
//# sourceMappingURL=announcement.dto.js.map