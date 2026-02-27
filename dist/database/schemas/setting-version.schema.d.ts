import { Document, Types } from 'mongoose';
export declare class SettingVersion extends Document {
    key: string;
    value: string;
    userId?: Types.ObjectId;
    username?: string;
    version: number;
}
export declare const SettingVersionSchema: import("mongoose").Schema<SettingVersion, import("mongoose").Model<SettingVersion, any, any, any, (Document<unknown, any, SettingVersion, any, import("mongoose").DefaultSchemaOptions> & SettingVersion & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, SettingVersion, any, import("mongoose").DefaultSchemaOptions> & SettingVersion & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, SettingVersion>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SettingVersion, Document<unknown, {}, SettingVersion, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    version?: import("mongoose").SchemaDefinitionProperty<number, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    key?: import("mongoose").SchemaDefinitionProperty<string, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    value?: import("mongoose").SchemaDefinitionProperty<string, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    username?: import("mongoose").SchemaDefinitionProperty<string, SettingVersion, Document<unknown, {}, SettingVersion, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SettingVersion & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, SettingVersion>;
