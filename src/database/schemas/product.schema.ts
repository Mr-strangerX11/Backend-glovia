import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SkinType } from './user.schema';

/**
 * Product Mongoose schema and document type
 *
 * The ProductDocument type is a best practice for type-safe Mongoose operations in NestJS.
 * It represents a hydrated Product document instance from the database.
 */
@Schema({ timestamps: true, collection: 'products' })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  ingredients?: string;

  @Prop()
  benefits?: string;

  @Prop()
  howToUse?: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  compareAtPrice?: number;

  @Prop({ default: 0 })
  discountPercentage?: number;

  @Prop()
  costPrice?: number;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop()
  barcode?: string;

  @Prop({ default: 0 })
  stockQuantity: number;

  @Prop({ default: 0 })
  quantityMl?: number;

  @Prop({ default: 10 })
  lowStockThreshold: number;

  @Prop()
  weight?: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brandId?: Types.ObjectId;

  // ===== VENDOR FIELDS (CRITICAL) =====
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  vendorId: Types.ObjectId;

  @Prop({ required: true })
  vendorName: string;

  @Prop({ required: true })
  vendorEmail: string;

  @Prop()
  vendorPhone?: string;

  @Prop({ type: String, enum: ['vendor', 'admin', 'superadmin'] })
  uploadedBy?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedById?: Types.ObjectId;
  // ===== END VENDOR FIELDS =====

  @Prop({ type: [String], enum: SkinType, default: [] })
  suitableFor: SkinType[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isBestSeller: boolean;

  @Prop({ default: false })
  isNewProduct: boolean;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for vendor filtering and search optimization
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ categoryId: 1, vendorId: 1 });
ProductSchema.index({ brandId: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ vendorId: 1, isActive: 1 });
ProductSchema.index({ vendorEmail: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ name: 'text', description: 'text' }); // Full-text search
ProductSchema.index({ stockQuantity: 1 }); // Low stock queries

// Type alias for a Product Mongoose document (for use with Model<ProductDocument>)
export type ProductDocument = Product & Document;
