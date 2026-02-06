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
exports.AdminInitController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
let AdminInitController = class AdminInitController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async initializeUsers() {
        const initToken = process.env.INIT_TOKEN || 'init-token-default-change-me';
        try {
            const result = await this.adminService.seedInitialUsers();
            return {
                status: 'success',
                message: 'Initial users created successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.AdminInitController = AdminInitController;
__decorate([
    (0, common_1.Post)('init'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminInitController.prototype, "initializeUsers", null);
exports.AdminInitController = AdminInitController = __decorate([
    (0, common_1.Controller)('api/v1/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminInitController);
//# sourceMappingURL=admin-init.controller.js.map