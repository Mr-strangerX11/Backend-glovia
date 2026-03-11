import { PaymentMethod } from '../../../database/schemas/order.schema';
declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    addressId: string;
    items: OrderItemDto[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
    note?: string;
    clearCart?: boolean;
}
export declare class TrackOrderDto {
    orderNumber: string;
    identifier: string;
}
export {};
