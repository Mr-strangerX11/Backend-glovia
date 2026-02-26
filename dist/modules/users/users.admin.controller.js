"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = require("./users.service");
const auditlog_service_1 = require("../auditlog/auditlog.service");
constructor(private, usersService, users_service_1.UsersService, private, auditLogService, auditlog_service_1.AuditLogService);
{ }
updatePermissions((), id, string, (), permissions, (Record), (), req, any);
{
    const updatedUser = await this.usersService.updateUserPermissions(id, permissions);
    const admin = req.user;
    await this.auditLogService.log('UPDATE_USER_PERMISSIONS', admin._id, admin.email, id, { permissions });
    return updatedUser;
}
//# sourceMappingURL=users.admin.controller.js.map