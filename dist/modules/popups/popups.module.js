"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const popups_schema_1 = require("./popups.schema");
const popups_service_1 = require("./popups.service");
const popups_controller_1 = require("./popups.controller");
let PopupsModule = class PopupsModule {
};
exports.PopupsModule = PopupsModule;
exports.PopupsModule = PopupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Popup', schema: popups_schema_1.PopupSchema },
            ]),
        ],
        providers: [popups_service_1.PopupsService],
        controllers: [popups_controller_1.PopupsController],
    })
], PopupsModule);
//# sourceMappingURL=popups.module.js.map