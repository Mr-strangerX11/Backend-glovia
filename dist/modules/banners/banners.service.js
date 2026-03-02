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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banner_schema_1 = require("../../database/schemas/banner.schema");
let BannersService = class BannersService {
    constructor(bannerModel) {
        this.bannerModel = bannerModel;
    }
    async findAll() {
        return this.bannerModel.find({
            isActive: true,
        }).sort({ displayOrder: 1 }).lean();
    }
    async findAllForAdmin() {
        return this.bannerModel.find().sort({ displayOrder: 1 }).lean();
    }
    async findOne(id) {
        const banner = await this.bannerModel.findById(id).lean();
        if (!banner) {
            throw new common_1.NotFoundException('Banner not found');
        }
        return banner;
    }
    async create(createBannerDto) {
        const banner = new this.bannerModel(createBannerDto);
        return banner.save();
    }
    async update(id, updateBannerDto) {
        const banner = await this.bannerModel.findByIdAndUpdate(id, updateBannerDto, { new: true });
        if (!banner) {
            throw new common_1.NotFoundException('Banner not found');
        }
        return banner;
    }
    async remove(id) {
        const banner = await this.bannerModel.findByIdAndDelete(id);
        if (!banner) {
            throw new common_1.NotFoundException('Banner not found');
        }
        return { message: 'Banner deleted successfully' };
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(banner_schema_1.Banner.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BannersService);
//# sourceMappingURL=banners.service.js.map