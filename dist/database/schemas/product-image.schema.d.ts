import { Document, Types } from 'mongoose';
export declare class ProductImage extends Document {
    productId: Types.ObjectId;
    url: string;
    altText?: string;
    displayOrder: number;
}
export declare const ProductImageSchema: import("mongoose").Schema<ProductImage, import("mongoose").Model<ProductImage, any, any, any, (Document<unknown, any, ProductImage, any, import("mongoose").DefaultSchemaOptions> & ProductImage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ProductImage, any, import("mongoose").DefaultSchemaOptions> & ProductImage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, ProductImage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductImage, Document<unknown, {}, ProductImage, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProductImage, Document<unknown, {}, ProductImage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, ProductImage, Document<unknown, {}, ProductImage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProductImage, Document<unknown, {}, ProductImage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    url?: import("mongoose").SchemaDefinitionProperty<string, ProductImage, Document<unknown, {}, ProductImage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    altText?: import("mongoose").SchemaDefinitionProperty<string, ProductImage, Document<unknown, {}, ProductImage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductImage & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ProductImage>;
