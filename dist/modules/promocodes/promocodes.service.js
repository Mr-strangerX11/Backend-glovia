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
let PromoCodesService = class PromoCodesService {
    constructor(promoCodeModel) {
        this.promoCodeModel = promoCodeModel;
    }
    async create(dto) {
        return this.promoCodeModel.create(dto);
    }
    async findAll() {
        return this.promoCodeModel.find().lean();
    }
    async findByCode(code) {
        const promo = await this.promoCodeModel.findOne({ code, isActive: true }).lean();
        if (!promo)
            throw new common_1.NotFoundException('Promo code not found');
        return promo;
    }
    async update(id, dto) {
        return this.promoCodeModel.findByIdAndUpdate(id, dto, { new: true });
    }
    async remove(id) {
        return this.promoCodeModel.findByIdAndDelete(id);
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('PromoCode')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PromoCodesService);
//# sourceMappingURL=promocodes.service.js.map