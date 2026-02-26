import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(): Promise<{
        totalOrders: number;
        totalRevenue: any;
        totalCustomers: number;
        totalProducts: number;
    }>;
    getSales(query: any): Promise<any[]>;
    getRevenue(query: any): Promise<any[]>;
    getTopProducts(query: any): Promise<any[]>;
    getTopCustomers(query: any): Promise<any[]>;
    getOrdersStats(query: any): Promise<any[]>;
}
