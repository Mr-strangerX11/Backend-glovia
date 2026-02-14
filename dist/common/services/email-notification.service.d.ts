interface OrderEmailItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
}
interface OrderEmailAddress {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    municipality: string;
    wardNo: number;
    area: string;
    landmark?: string;
}
interface OrderEmailPayload {
    orderNumber: string;
    total: number;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    items: OrderEmailItem[];
    address: OrderEmailAddress;
}
export declare class EmailNotificationService {
    private readonly logger;
    private readonly provider;
    private transporter;
    constructor();
    sendOrderConfirmedEmail(payload: OrderEmailPayload, adminEmail?: string): Promise<void>;
    private buildOrderConfirmedHtml;
}
export {};
