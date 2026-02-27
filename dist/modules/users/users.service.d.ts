import { Model, Types } from 'mongoose';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/users.dto';
import { AddAddressWithGeoDto } from './dto/add-address-geo.dto';
import { User, Address, Order } from '../../database/schemas';
export declare class UsersService {
    private userModel;
    private addressModel;
    private orderModel;
    constructor(userModel: Model<User>, addressModel: Model<Address>, orderModel: Model<Order>);
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
