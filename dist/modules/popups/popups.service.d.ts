import { Model } from 'mongoose';
import { Popup } from './popups.schema';
export declare class PopupsService {
    private popupModel;
    constructor(popupModel: Model<Popup>);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, Popup, {}, import("mongoose").DefaultSchemaOptions> & Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findActive(): Promise<(Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    update(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, Popup, {}, import("mongoose").DefaultSchemaOptions> & Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, Popup, {}, import("mongoose").DefaultSchemaOptions> & Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
