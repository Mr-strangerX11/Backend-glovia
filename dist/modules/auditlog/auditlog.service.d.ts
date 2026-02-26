import { Model, Types } from 'mongoose';
import { AuditLog } from './auditlog.schema';
export declare class AuditLogService {
    private auditLogModel;
    constructor(auditLogModel: Model<AuditLog>);
    log(action: string, performedBy: Types.ObjectId, performedByEmail: string, target: string, details?: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, AuditLog, {}, import("mongoose").DefaultSchemaOptions> & AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(limit?: number): Promise<(AuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
