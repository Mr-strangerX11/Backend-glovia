import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  VENDOR = 'VENDOR',
  EDITOR = 'EDITOR',
  MARKETING = 'MARKETING',
  AUDITOR = 'AUDITOR',
}

export enum SkinType {
  DRY = 'DRY',
  OILY = 'OILY',
  COMBINATION = 'COMBINATION',
  SENSITIVE = 'SENSITIVE',
  NORMAL = 'NORMAL',
}

@Schema({ timestamps: true, collection: 'users', suppressReservedKeysWarning: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;


  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({
    type: Object,
    default: {
      canEditProducts: false,
      canViewOrders: false,
      canManageUsers: false,
      canManageBanners: false,
      canViewAnalytics: false,
      canManagePromos: false,
      canViewAuditLogs: false,
    },
  })
  permissions: {
    canEditProducts?: boolean;
    canViewOrders?: boolean;
    canManageUsers?: boolean;
    canManageBanners?: boolean;
    canViewAnalytics?: boolean;
    canManagePromos?: boolean;
    canViewAuditLogs?: boolean;
    [key: string]: boolean | undefined;
  };

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ type: String, enum: SkinType })
  skinType?: SkinType;

  @Prop()
  profileImage?: string;

  @Prop()
  refreshToken?: string;

  // Trust & Security
  @Prop({ default: 0 })
  trustScore: number;

  @Prop()
  deviceFingerprint?: string;

  @Prop()
  ipAddress?: string;

  @Prop({ default: 0 })
  failedAttempts: number;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes: phone and email are unique, role for filtering
UserSchema.index({ role: 1 });
