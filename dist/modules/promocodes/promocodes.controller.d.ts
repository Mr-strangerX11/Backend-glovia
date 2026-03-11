import { PromoCodesService } from './promocodes.service';
export declare class PromoCodesController {
    private promoCodesService;
    constructor(promoCodesService: PromoCodesService);
    findAllForAdmin(): Promise<(import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findAll(): Promise<(import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByCode(code: string): Promise<import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Coupon, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Coupon, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas").Coupon, {}, import("mongoose").DefaultSchemaOptions> & import("../../database/schemas").Coupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
