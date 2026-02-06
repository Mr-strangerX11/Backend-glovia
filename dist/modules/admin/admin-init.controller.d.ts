import { AdminService } from './admin.service';
export declare class AdminInitController {
    private adminService;
    constructor(adminService: AdminService);
    initializeUsers(): Promise<{
        status: string;
        message: string;
        data: any[];
    }>;
}
