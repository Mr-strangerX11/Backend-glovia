import { Document } from 'mongoose';
export declare class Popup extends Document {
    title: string;
    content: string;
    image?: string;
    link?: string;
    isActive: boolean;
    showOnce: boolean;
    expiresAt?: Date;
}
export declare const PopupSchema: import("mongoose").Schema<Popup, import("mongoose").Model<Popup, any, any, any, (Document<unknown, any, Popup, any, import("mongoose").DefaultSchemaOptions> & Popup & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Popup, any, import("mongoose").DefaultSchemaOptions> & Popup & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Popup>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Popup, Document<unknown, {}, Popup, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    link?: import("mongoose").SchemaDefinitionProperty<string, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    image?: import("mongoose").SchemaDefinitionProperty<string, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    content?: import("mongoose").SchemaDefinitionProperty<string, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    showOnce?: import("mongoose").SchemaDefinitionProperty<boolean, Popup, Document<unknown, {}, Popup, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Popup & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Popup>;
