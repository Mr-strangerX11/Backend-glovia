import { Document, Types } from 'mongoose';
export declare class WishlistItem extends Document {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
}
export declare const WishlistItemSchema: import("mongoose").Schema<WishlistItem, import("mongoose").Model<WishlistItem, any, any, any, (Document<unknown, any, WishlistItem, any, import("mongoose").DefaultSchemaOptions> & WishlistItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, WishlistItem, any, import("mongoose").DefaultSchemaOptions> & WishlistItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, WishlistItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WishlistItem, Document<unknown, {}, WishlistItem, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<WishlistItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, WishlistItem, Document<unknown, {}, WishlistItem, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<WishlistItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, WishlistItem, Document<unknown, {}, WishlistItem, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<WishlistItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, WishlistItem, Document<unknown, {}, WishlistItem, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<WishlistItem & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, WishlistItem>;
