import { PromoCodesService } from './promocodes.service';
export declare class PromoCodesController {
    private promoCodesService;
    constructor(promoCodesService: PromoCodesService);
    findAll(): Promise<(import("./promocodes.schema").PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByCode(code: string): Promise<import("./promocodes.schema").PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("./promocodes.schema").PromoCode, {}, import("mongoose").DefaultSchemaOptions> & import("./promocodes.schema").PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./promocodes.schema").PromoCode, {}, import("mongoose").DefaultSchemaOptions> & import("./promocodes.schema").PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./promocodes.schema").PromoCode, {}, import("mongoose").DefaultSchemaOptions> & import("./promocodes.schema").PromoCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
