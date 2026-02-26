import { Document, Types } from 'mongoose';
export declare class ProductVariant extends Document {
    productId: Types.ObjectId;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    isActive: boolean;
    options: Record<string, string>;
}
export declare const ProductVariantSchema: import("mongoose").Schema<ProductVariant, import("mongoose").Model<ProductVariant, any, any, any, (Document<unknown, any, ProductVariant, any, import("mongoose").DefaultSchemaOptions> & ProductVariant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ProductVariant, any, import("mongoose").DefaultSchemaOptions> & ProductVariant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, ProductVariant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductVariant, Document<unknown, {}, ProductVariant, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    name?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    options?: import("mongoose").SchemaDefinitionProperty<Record<string, string>, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    price?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    compareAtPrice?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sku?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    stockQuantity?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ProductVariant>;
