import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AdminIpAllowlistGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
