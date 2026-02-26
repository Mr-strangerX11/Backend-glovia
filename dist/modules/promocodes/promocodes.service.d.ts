import { Model } from 'mongoose';
import { PromoCode } from './promocodes.schema';
export declare class PromoCodesService {
    private promoCodeModel;
    constructor(promoCodeModel: Model<PromoCode>);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, PromoCode, {}, import("mongoose").DefaultSchemaOptions> & PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByCode(code: string): Promise<PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, PromoCode, {}, import("mongoose").DefaultSchemaOptions> & PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, PromoCode, {}, import("mongoose").DefaultSchemaOptions> & PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
