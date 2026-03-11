import { Model } from 'mongoose';
import { Coupon } from '../../database/schemas/coupon.schema';
export declare class PromoCodesService {
    private couponModel;
    constructor(couponModel: Model<Coupon>);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, Coupon, {}, import("mongoose").DefaultSchemaOptions> & Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findAllForAdmin(): Promise<(Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByCode(code: string): Promise<Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, Coupon, {}, import("mongoose").DefaultSchemaOptions> & Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, Coupon, {}, import("mongoose").DefaultSchemaOptions> & Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    private mapCouponPayload;
    private toNumber;
    private toDate;
}
