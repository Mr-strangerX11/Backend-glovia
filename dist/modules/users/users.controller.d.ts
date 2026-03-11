import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto, SendEmailChangeOtpDto, VerifyEmailChangeOtpDto } from './dto/users.dto';
import { AddAddressWithGeoDto } from './dto/add-address-geo.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<import("../../database/schemas").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("../../database/schemas").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    sendEmailChangeOtp(userId: string, dto: SendEmailChangeOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailChangeOtp(userId: string, dto: VerifyEmailChangeOtpDto): Promise<{
        success: boolean;
        message: string;
        email: string;
    }>;
    getAddresses(userId: string): Promise<(import("../../database/schemas").Address & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createAddress(userId: string, dto: CreateAddressDto): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Address, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Address & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createAddressWithGeo(userId: string, dto: AddAddressWithGeoDto): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Address, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Address & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<(import("../../database/schemas").Address & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        isDefault: boolean;
        userId: import("mongoose").Types.ObjectId;
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
        _id: import("mongoose").Types.ObjectId;
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
    getOrderHistory(userId: string): Promise<(import("../../database/schemas").Order & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
