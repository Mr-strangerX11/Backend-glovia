import { UserRole } from '../../../database/schemas/user.schema';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}
export declare class UpdateUserRoleDto {
    role: UserRole;
}
