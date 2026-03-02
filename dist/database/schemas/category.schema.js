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
exports.CategorySchema = exports.Category = exports.ProductCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["SKINCARE"] = "SKINCARE";
    ProductCategory["HAIRCARE"] = "HAIRCARE";
    ProductCategory["MAKEUP"] = "MAKEUP";
    ProductCategory["BODY_CARE"] = "BODY_CARE";
    ProductCategory["TOOLS_ACCESSORIES"] = "TOOLS_ACCESSORIES";
    ProductCategory["FRAGRANCE"] = "FRAGRANCE";
    ProductCategory["ORGANIC_NATURAL"] = "ORGANIC_NATURAL";
    ProductCategory["MENS_GROOMING"] = "MENS_GROOMING";
    ProductCategory["ORGANIC"] = "ORGANIC";
    ProductCategory["HERBAL"] = "HERBAL";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
let Category = class Category extends mongoose_2.Document {
};
exports.Category = Category;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "image", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ProductCategory, required: true }),
    __metadata("design:type", String)
], Category.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Category' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Category.prototype, "parentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Category.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Category.prototype, "displayOrder", void 0);
exports.Category = Category = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'categories' })
], Category);
exports.CategorySchema = mongoose_1.SchemaFactory.createForClass(Category);
exports.CategorySchema.index({ parentId: 1 });
exports.CategorySchema.index({ isActive: 1 });
//# sourceMappingURL=category.schema.js.map