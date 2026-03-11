import { Model, Types } from 'mongoose';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/users.dto';
import { AddAddressWithGeoDto } from './dto/add-address-geo.dto';
import { User, Address, Order } from '../../database/schemas';
import { OtpVerification } from '../../database/schemas/otp-verification.schema';
import { OtpService, EmailOtpService } from '../verification/otp.service';
export declare class UsersService {
    private userModel;
    private addressModel;
    private orderModel;
    private otpVerificationModel;
    private otpService;
    private emailOtpService;
    constructor(userModel: Model<User>, addressModel: Model<Address>, orderModel: Model<Order>, otpVerificationModel: Model<OtpVerification>, otpService: OtpService, emailOtpService: EmailOtpService);
    updateUserPermissions(userId: string, permissions: Record<string, boolean>): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getProfile(userId: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    sendEmailChangeOtp(userId: string, email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailChangeOtp(userId: string, email: string, otp: string): Promise<{
        success: boolean;
        message: string;
        email: string;
    }>;
    getAddresses(userId: string): Promise<(Address & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createAddress(userId: string, dto: CreateAddressDto): Promise<import("mongoose").Document<unknown, {}, Address, {}, import("mongoose").DefaultSchemaOptions> & Address & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<(Address & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        isDefault: boolean;
        userId: Types.ObjectId;
        fullName: string;
        phone: string;
        province: string;
        district: string;
        municipality: string;
        wardNo: number;
        area: string;
        landmark?: string;
        latitude?: number;
        longitude?: number;
        isVerified: boolean;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    deleteAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
    createAddressWithGeo(userId: string, dto: AddAddressWithGeoDto): Promise<import("mongoose").Document<unknown, {}, Address, {}, import("mongoose").DefaultSchemaOptions> & Address & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getOrderHistory(userId: string): Promise<(Order & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
