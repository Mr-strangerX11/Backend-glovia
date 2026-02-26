import { Model } from 'mongoose';
import { Order } from '../../database/schemas/order.schema';
import { User } from '../../database/schemas/user.schema';
import { Product } from '../../database/schemas/product.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
export declare class AnalyticsService {
    private orderModel;
    private userModel;
    private productModel;
    private orderItemModel;
    constructor(orderModel: Model<Order>, userModel: Model<User>, productModel: Model<Product>, orderItemModel: Model<OrderItem>);
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
