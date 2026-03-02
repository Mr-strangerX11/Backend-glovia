import { Model } from 'mongoose';
import { Banner } from '../../database/schemas/banner.schema';
export declare class BannersService {
    private bannerModel;
    constructor(bannerModel: Model<Banner>);
    findAll(): Promise<(Banner & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findAllForAdmin(): Promise<(Banner & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<Banner & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createBannerDto: any): Promise<import("mongoose").Document<unknown, {}, Banner, {}, import("mongoose").DefaultSchemaOptions> & Banner & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateBannerDto: any): Promise<import("mongoose").Document<unknown, {}, Banner, {}, import("mongoose").DefaultSchemaOptions> & Banner & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
