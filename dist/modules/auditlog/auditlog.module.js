"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auditlog_schema_1 = require("./auditlog.schema");
const auditlog_service_1 = require("./auditlog.service");
const auditlog_controller_1 = require("./auditlog.controller");
let AuditLogModule = class AuditLogModule {
};
exports.AuditLogModule = AuditLogModule;
exports.AuditLogModule = AuditLogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'AuditLog', schema: auditlog_schema_1.AuditLogSchema },
            ]),
        ],
        providers: [auditlog_service_1.AuditLogService],
        controllers: [auditlog_controller_1.AuditLogController],
        exports: [auditlog_service_1.AuditLogService],
    })
], AuditLogModule);
//# sourceMappingURL=auditlog.module.js.map