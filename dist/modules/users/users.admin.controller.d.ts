import { UsersService } from './users.service';
import { AuditLogService } from '../auditlog/auditlog.service';
export declare class AdminUsersController {
    private usersService;
    private auditLogService;
    constructor(usersService: UsersService, auditLogService: AuditLogService);
    updatePermissions(id: string, permissions: Record<string, boolean>, req: any): Promise<import("../../database/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
