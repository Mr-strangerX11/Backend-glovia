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
exports.DebugController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let DebugController = class DebugController {
    constructor(configService) {
        this.configService = configService;
    }
    checkEnv() {
        const jwtSecret = this.configService.get('JWT_SECRET');
        const dbUrl = this.configService.get('DATABASE_URL');
        return {
            hasJwtSecret: !!jwtSecret,
            jwtSecretLength: jwtSecret?.length || 0,
            jwtSecretPreview: jwtSecret ? jwtSecret.substring(0, 10) + '...' : 'NOT SET',
            hasDatabaseUrl: !!dbUrl,
            nodeEnv: process.env.NODE_ENV,
            frontendUrl: this.configService.get('FRONTEND_URL'),
        };
    }
};
exports.DebugController = DebugController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('env-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "checkEnv", null);
exports.DebugController = DebugController = __decorate([
    (0, common_1.Controller)('debug'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DebugController);
//# sourceMappingURL=auth.controller.debug.js.map