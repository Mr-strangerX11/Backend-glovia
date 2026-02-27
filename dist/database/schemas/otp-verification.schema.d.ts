import { Document, Types } from 'mongoose';
export declare class OtpVerification extends Document {
    userId: Types.ObjectId;
    phone: string;
    otp: string;
    purpose: string;
    expiresAt: Date;
    isVerified: boolean;
    attempts: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const OtpVerificationSchema: import("mongoose").Schema<OtpVerification, import("mongoose").Model<OtpVerification, any, any, any, (Document<unknown, any, OtpVerification, any, import("mongoose").DefaultSchemaOptions> & OtpVerification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, OtpVerification, any, import("mongoose").DefaultSchemaOptions> & OtpVerification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, OtpVerification>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OtpVerification, Document<unknown, {}, OtpVerification, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    phone?: import("mongoose").SchemaDefinitionProperty<string, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isVerified?: import("mongoose").SchemaDefinitionProperty<boolean, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    otp?: import("mongoose").SchemaDefinitionProperty<string, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    purpose?: import("mongoose").SchemaDefinitionProperty<string, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    attempts?: import("mongoose").SchemaDefinitionProperty<number, OtpVerification, Document<unknown, {}, OtpVerification, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<OtpVerification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, OtpVerification>;
