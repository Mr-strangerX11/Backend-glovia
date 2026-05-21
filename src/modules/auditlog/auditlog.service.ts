import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from './auditlog.schema';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLog>
  ) {}

  async log(action: string, performedBy: Types.ObjectId, performedByEmail: string, target: string, details?: Record<string, any>) {
    return this.auditLogModel.create({ action, performedBy, performedByEmail, target, details });
  }

  async findAll(limit = 100, page = 1) {
    const skip = (page - 1) * limit;
    return this.auditLogModel
      .find()
      .select('_id action performedBy performedByEmail target createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }
}
