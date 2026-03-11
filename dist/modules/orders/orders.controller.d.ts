import { OrdersService } from './orders.service';
import { CreateOrderDto, TrackOrderDto } from './dto/orders.dto';
import { OrderStatus } from '../../database/schemas/order.schema';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    track(query: TrackOrderDto): Promise<{
        _id: import("mongoose").Types.ObjectId;
        orderNumber: string;
        status: OrderStatus;
        createdAt: any;
        confirmedAt: Date;
        shippedAt: Date;
        deliveredAt: Date;
        cancelledAt: Date;
        trackingNumber: string;
        deliveryPartner: string;
        paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
        paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
        subtotal: number;
        discount: number;
        deliveryCharge: number;
        total: number;
        customerName: string;
        items: {
            product: any;
            images: any[];
            orderId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            price: number;
            total: number;
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        address: import("../../database/schemas").Address & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        payment: import("../../database/schemas").Payment & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        timeline: {
            key: string;
            label: string;
            at: any;
        }[];
    }>;
    create(userId: string, dto: CreateOrderDto): Promise<{
        items: {
            images: any[];
            orderId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            price: number;
            total: number;
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        address: import("../../database/schemas").Address & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        payment: import("../../database/schemas").Payment & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        orderNumber: string;
        userId: import("mongoose").Types.ObjectId;
        addressId: import("mongoose").Types.ObjectId;
        subtotal: number;
        discount: number;
        deliveryCharge: number;
        total: number;
        status: OrderStatus;
        paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
        paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
        customerNote?: string;
        adminNote?: string;
        trackingNumber?: string;
        deliveryPartner?: string;
        confirmedAt?: Date;
        shippedAt?: Date;
        deliveredAt?: Date;
        cancelledAt?: Date;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    findAll(userId: string, status?: OrderStatus): Promise<{
        items: any[];
        address: any;
        payment: any;
        orderNumber: string;
        userId: import("mongoose").Types.ObjectId;
        addressId: import("mongoose").Types.ObjectId;
        subtotal: number;
        discount: number;
        deliveryCharge: number;
        total: number;
        status: OrderStatus;
        paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
        paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
        customerNote?: string;
        adminNote?: string;
        trackingNumber?: string;
        deliveryPartner?: string;
        confirmedAt?: Date;
        shippedAt?: Date;
        deliveredAt?: Date;
        cancelledAt?: Date;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
    findOne(userId: string, orderId: string): Promise<{
        items: {
            images: any[];
            orderId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            price: number;
            total: number;
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        address: import("../../database/schemas").Address & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        payment: import("../../database/schemas").Payment & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        orderNumber: string;
        userId: import("mongoose").Types.ObjectId;
        addressId: import("mongoose").Types.ObjectId;
        subtotal: number;
        discount: number;
        deliveryCharge: number;
        total: number;
        status: OrderStatus;
        paymentStatus: import("../../database/schemas/order.schema").PaymentStatus;
        paymentMethod: import("../../database/schemas/order.schema").PaymentMethod;
        customerNote?: string;
        adminNote?: string;
        trackingNumber?: string;
        deliveryPartner?: string;
        confirmedAt?: Date;
        shippedAt?: Date;
        deliveredAt?: Date;
        cancelledAt?: Date;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    cancel(userId: string, orderId: string): Promise<import("../../database/schemas/order.schema").Order & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
