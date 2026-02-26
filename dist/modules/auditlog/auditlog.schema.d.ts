import { Document, Types } from 'mongoose';
export declare class AuditLog extends Document {
    action: string;
    performedBy: Types.ObjectId;
    performedByEmail: string;
    target: string;
    details?: Record<string, any>;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, (Document<unknown, any, AuditLog, any, import("mongoose").DefaultSchemaOptions> & AuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, AuditLog, any, import("mongoose").DefaultSchemaOptions> & AuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, AuditLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, AuditLog, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    action?: import("mongoose").SchemaDefinitionProperty<string, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    performedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    performedByEmail?: import("mongoose").SchemaDefinitionProperty<string, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    target?: import("mongoose").SchemaDefinitionProperty<string, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    details?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, AuditLog>;
