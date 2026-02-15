"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../database/schemas/order.schema");
const config_1 = require("@nestjs/config");
const order_schema_2 = require("../../database/schemas/order.schema");
const order_item_schema_1 = require("../../database/schemas/order-item.schema");
const product_schema_1 = require("../../database/schemas/product.schema");
const address_schema_1 = require("../../database/schemas/address.schema");
const payment_schema_1 = require("../../database/schemas/payment.schema");
const cart_item_schema_1 = require("../../database/schemas/cart-item.schema");
const coupon_schema_1 = require("../../database/schemas/coupon.schema");
const product_image_schema_1 = require("../../database/schemas/product-image.schema");
const email_notification_service_1 = require("../../common/services/email-notification.service");
const user_schema_1 = require("../../database/schemas/user.schema");
let OrdersService = class OrdersService {
    constructor(orderModel, orderItemModel, productModel, addressModel, paymentModel, cartItemModel, couponModel, productImageModel, userModel, configService, emailNotificationService) {
        this.orderModel = orderModel;
        this.orderItemModel = orderItemModel;
        this.productModel = productModel;
        this.addressModel = addressModel;
        this.paymentModel = paymentModel;
        this.cartItemModel = cartItemModel;
        this.couponModel = couponModel;
        this.productImageModel = productImageModel;
        this.userModel = userModel;
        this.configService = configService;
        this.emailNotificationService = emailNotificationService;
    }
    async create(userId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(dto.addressId)) {
            throw new common_1.BadRequestException('Invalid address ID');
        }
        const address = await this.addressModel.findOne({
            _id: new mongoose_2.Types.ObjectId(dto.addressId),
            userId: new mongoose_2.Types.ObjectId(userId)
        }).lean();
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        const orderNumber = this.generateOrderNumber();
        const items = [];
        let subtotal = 0;
        for (const item of dto.items) {
            if (!mongoose_2.Types.ObjectId.isValid(item.productId)) {
                throw new common_1.BadRequestException('Invalid product ID');
            }
            const product = await this.productModel.findById(item.productId).lean();
            if (!product) {
                throw new common_1.NotFoundException(`Product not found`);
            }
            if (!product.isActive) {
                throw new common_1.BadRequestException(`${product.name} is not available`);
            }
            if (product.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const priceNumber = Number(product.price);
            const itemTotal = priceNumber * item.quantity;
            items.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
                total: itemTotal,
            });
            subtotal += itemTotal;
        }
        const deliveryCharge = this.calculateDeliveryCharge(address.district, subtotal);
        const discount = dto.couponCode ? await this.calculateDiscount(dto.couponCode, subtotal) : 0;
        const total = subtotal + deliveryCharge - discount;
        const order = new this.orderModel({
            orderNumber,
            userId: new mongoose_2.Types.ObjectId(userId),
            addressId: address._id,
            subtotal,
            discount,
            deliveryCharge,
            total,
            paymentMethod: dto.paymentMethod || order_schema_1.PaymentMethod.CASH_ON_DELIVERY,
            customerNote: dto.note,
            status: order_schema_1.OrderStatus.PENDING,
        });
        const savedOrder = await order.save();
        const orderItems = items.map(item => ({
            ...item,
            orderId: savedOrder._id,
        }));
        await this.orderItemModel.insertMany(orderItems);
        for (const item of items) {
            await this.productModel.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: -item.quantity } }, { new: true });
        }
        if (dto.paymentMethod === order_schema_1.PaymentMethod.CASH_ON_DELIVERY) {
            await this.paymentModel.create({
                orderId: savedOrder._id,
                method: order_schema_1.PaymentMethod.CASH_ON_DELIVERY,
                amount: total,
                status: order_schema_1.PaymentStatus.PENDING,
            });
        }
        if (dto.clearCart) {
            await this.cartItemModel.deleteMany({
                userId: new mongoose_2.Types.ObjectId(userId)
            });
        }
        try {
            const user = await this.userModel.findById(userId).lean();
            if (user && user.email) {
                const payload = {
                    orderNumber,
                    total,
                    subtotal,
                    discount,
                    deliveryCharge,
                    paymentMethod: dto.paymentMethod || order_schema_1.PaymentMethod.CASH_ON_DELIVERY,
                    customerName: user.firstName + ' ' + user.lastName,
                    customerEmail: user.email,
                    items: items.map(item => ({
                        name: item.productId.toString(),
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                    })),
                    address: {
                        fullName: user.firstName + ' ' + user.lastName,
                        phone: user.phone || '',
                        province: address.province,
                        district: address.district,
                        municipality: address.municipality,
                        wardNo: address.wardNo,
                        area: address.area,
                        landmark: address.landmark,
                    },
                };
                await this.emailNotificationService.sendOrderConfirmedEmail(payload, 'glovianepal@gmail.com');
            }
        }
        catch (e) {
            console.error('Failed to send order confirmation email:', e);
        }
        return this.findOne(userId, savedOrder._id.toString());
    }
    async findAll(userId, filters) {
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const match = { userId: userObjId };
        if (filters?.status) {
            match.status = filters.status;
        }
        const orders = await this.orderModel.find(match).sort({ createdAt: -1 }).lean();
        const orderIds = orders.map(o => o._id);
        const [items, payments, addresses] = await Promise.all([
            this.orderItemModel.find({ orderId: { $in: orderIds } }).lean(),
            this.paymentModel.find({ orderId: { $in: orderIds } }).lean(),
            this.addressModel.find({ _id: { $in: orders.map(o => o.addressId) } }).lean(),
        ]);
        const productIds = items.map(i => i.productId);
        const productImages = await this.productImageModel.find({
            productId: { $in: productIds }
        }).lean();
        const imagesByProduct = productImages.reduce((acc, img) => {
            const key = img.productId.toString();
            if (!acc[key])
                acc[key] = [];
            acc[key].push(img);
            return acc;
        }, {});
        const itemsByOrder = items.reduce((acc, item) => {
            const key = item.orderId.toString();
            if (!acc[key])
                acc[key] = [];
            acc[key].push({
                ...item,
                images: imagesByProduct[item.productId.toString()] || []
            });
            return acc;
        }, {});
        const paymentsByOrder = payments.reduce((acc, p) => {
            acc[p.orderId.toString()] = p;
            return acc;
        }, {});
        const addressMap = addresses.reduce((acc, a) => {
            acc[a._id.toString()] = a;
            return acc;
        }, {});
        return orders.map(order => ({
            ...order,
            items: itemsByOrder[order._id.toString()] || [],
            address: addressMap[order.addressId.toString()] || null,
            payment: paymentsByOrder[order._id.toString()] || null,
        }));
    }
    async findOne(userId, orderId) {
        if (!mongoose_2.Types.ObjectId.isValid(orderId)) {
            throw new common_1.BadRequestException('Invalid order ID');
        }
        const order = await this.orderModel.findOne({
            _id: new mongoose_2.Types.ObjectId(orderId),
            userId: new mongoose_2.Types.ObjectId(userId)
        }).lean();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const [items, payment, address] = await Promise.all([
            this.orderItemModel.find({ orderId: order._id }).lean(),
            this.paymentModel.findOne({ orderId: order._id }).lean(),
            this.addressModel.findById(order.addressId).lean(),
        ]);
        const productIds = items.map(i => i.productId);
        const productImages = await this.productImageModel.find({
            productId: { $in: productIds }
        }).lean();
        const imagesByProduct = productImages.reduce((acc, img) => {
            const key = img.productId.toString();
            if (!acc[key])
                acc[key] = [];
            acc[key].push(img);
            return acc;
        }, {});
        return {
            ...order,
            items: items.map(item => ({
                ...item,
                images: imagesByProduct[item.productId.toString()] || []
            })),
            address,
            payment,
        };
    }
    async cancelOrder(userId, orderId) {
        if (!mongoose_2.Types.ObjectId.isValid(orderId)) {
            throw new common_1.BadRequestException('Invalid order ID');
        }
        const order = await this.orderModel.findOne({
            _id: new mongoose_2.Types.ObjectId(orderId),
            userId: new mongoose_2.Types.ObjectId(userId)
        }).lean();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const cancellableStatuses = [order_schema_1.OrderStatus.PENDING, order_schema_1.OrderStatus.CONFIRMED];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be cancelled');
        }
        const items = await this.orderItemModel.find({ orderId: order._id }).lean();
        const updatedOrder = await this.orderModel.findByIdAndUpdate(orderId, {
            status: order_schema_1.OrderStatus.CANCELLED,
            cancelledAt: new Date(),
        }, { new: true }).lean();
        for (const item of items) {
            await this.productModel.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } }, { new: true });
        }
        return updatedOrder;
    }
    generateOrderNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        return `ORD${timestamp}${random}`;
    }
    calculateDeliveryCharge(district, subtotal) {
        const freeDeliveryThreshold = Number(this.configService.get('FREE_DELIVERY_THRESHOLD', 2000));
        if (subtotal >= freeDeliveryThreshold) {
            return 0;
        }
        const valleyDistricts = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
        const valleyCharge = Number(this.configService.get('VALLEY_DELIVERY_CHARGE', 100));
        const outsideValleyCharge = Number(this.configService.get('OUTSIDE_VALLEY_CHARGE', 150));
        return valleyDistricts.includes(district)
            ? valleyCharge
            : outsideValleyCharge;
    }
    async calculateDiscount(couponCode, subtotal) {
        const coupon = await this.couponModel.findOne({ code: couponCode }).lean();
        if (!coupon || !coupon.isActive) {
            return 0;
        }
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return 0;
        }
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
            return 0;
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return 0;
        }
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, Number(coupon.maxDiscount));
            }
        }
        else {
            discount = Number(coupon.discountValue);
        }
        await this.couponModel.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } }, { new: true });
        return discount;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_2.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(order_item_schema_1.OrderItem.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(3, (0, mongoose_1.InjectModel)(address_schema_1.Address.name)),
    __param(4, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(5, (0, mongoose_1.InjectModel)(cart_item_schema_1.CartItem.name)),
    __param(6, (0, mongoose_1.InjectModel)(coupon_schema_1.Coupon.name)),
    __param(7, (0, mongoose_1.InjectModel)(product_image_schema_1.ProductImage.name)),
    __param(8, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        email_notification_service_1.EmailNotificationService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map