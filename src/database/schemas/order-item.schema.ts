import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'order_items' })
export class OrderItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  // ===== VENDOR FIELDS (CRITICAL) =====
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  vendorId: Types.ObjectId;

  @Prop({ required: true })
  vendorName: string;

  @Prop({ required: true })
  vendorEmail: string;

  @Prop()
  vendorPhone?: string;
  // ===== END VENDOR FIELDS =====

  @Prop({ required: false })
  productName: string;

  @Prop()
  productSku?: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  total: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Indexes for vendor-specific queries
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ vendorId: 1 });
OrderItemSchema.index({ vendorId: 1, createdAt: -1 }); // Vendor order history
