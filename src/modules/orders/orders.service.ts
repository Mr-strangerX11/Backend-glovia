import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/orders.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../database/schemas/order.schema';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../database/schemas/order.schema';
import { OrderItem } from '../../database/schemas/order-item.schema';
import { Product } from '../../database/schemas/product.schema';
import { Address } from '../../database/schemas/address.schema';
import { Payment } from '../../database/schemas/payment.schema';
import { CartItem } from '../../database/schemas/cart-item.schema';
import { Coupon } from '../../database/schemas/coupon.schema';
import { ProductImage } from '../../database/schemas/product-image.schema';
import { EmailNotificationService } from '../../common/services/email-notification.service';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Address.name) private addressModel: Model<Address>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
    @InjectModel(Coupon.name) private couponModel: Model<Coupon>,
    @InjectModel(ProductImage.name) private productImageModel: Model<ProductImage>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (!Types.ObjectId.isValid(dto.addressId)) {
      throw new BadRequestException('Invalid address ID');
    }

    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(dto.addressId),
      userId: new Types.ObjectId(userId)
    }).lean();

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderNumber = this.generateOrderNumber();

    // Validate and prepare items
    const items = [];
    let subtotal = 0;

    for (const item of dto.items) {
      if (!Types.ObjectId.isValid(item.productId)) {
        throw new BadRequestException('Invalid product ID');
      }

      const product = await this.productModel.findById(item.productId).lean();

      if (!product) {
        throw new NotFoundException(`Product not found`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`${product.name} is not available`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );
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

    // Create order
    const order = new this.orderModel({
      orderNumber,
      userId: new Types.ObjectId(userId),
      addressId: address._id,
      subtotal,
      discount,
      deliveryCharge,
      total,
      paymentMethod: dto.paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
      customerNote: dto.note,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await order.save();

    // Create order items
    const orderItems = items.map(item => ({
      ...item,
      orderId: savedOrder._id,
    }));

    await this.orderItemModel.insertMany(orderItems);

    // Update product stock
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
    }

    // Create payment record for COD
    if (dto.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      await this.paymentModel.create({
        orderId: savedOrder._id,
        method: PaymentMethod.CASH_ON_DELIVERY,
        amount: total,
        status: PaymentStatus.PENDING,
      });
    }

    // Clear cart if requested
    if (dto.clearCart) {
      await this.cartItemModel.deleteMany({
        userId: new Types.ObjectId(userId)
      });
    }

    // Send order confirmation email to customer and admin
    try {
      const user = await this.userModel.findById(userId).lean();
      if (user && user.email) {
        const payload = {
          orderNumber,
          total,
          subtotal,
          discount,
          deliveryCharge,
          paymentMethod: dto.paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
          customerName: user.firstName + ' ' + user.lastName,
          customerEmail: user.email,
          items: items.map(item => ({
            name: item.productId.toString(), // You can populate product name if needed
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
    } catch (e) {
      console.error('Failed to send order confirmation email:', e);
    }

    return this.findOne(userId, savedOrder._id.toString());
  }

  async findAll(userId: string, filters?: { status?: OrderStatus }) {
    const userObjId = new Types.ObjectId(userId);
    const match: any = { userId: userObjId };

    if (filters?.status) {
      match.status = filters.status;
    }

    const orders = await this.orderModel.find(match).sort({ createdAt: -1 }).lean();

    // Get items, addresses, payments
    const orderIds = orders.map(o => o._id);
    const [items, payments, addresses] = await Promise.all([
      this.orderItemModel.find({ orderId: { $in: orderIds } }).lean(),
      this.paymentModel.find({ orderId: { $in: orderIds } }).lean(),
      this.addressModel.find({ _id: { $in: orders.map(o => o.addressId) } }).lean(),
    ]);

    // Get product images
    const productIds = items.map(i => i.productId);
    const productImages = await this.productImageModel.find({
      productId: { $in: productIds }
    }).lean();

    const imagesByProduct = productImages.reduce((acc, img) => {
      const key = img.productId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {} as Record<string, any[]>);

    const itemsByOrder = items.reduce((acc, item) => {
      const key = item.orderId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        ...item,
        images: imagesByProduct[item.productId.toString()] || []
      });
      return acc;
    }, {} as Record<string, any[]>);

    const paymentsByOrder = payments.reduce((acc, p) => {
      acc[p.orderId.toString()] = p;
      return acc;
    }, {} as Record<string, any>);

    const addressMap = addresses.reduce((acc, a) => {
      acc[a._id.toString()] = a;
      return acc;
    }, {} as Record<string, any>);

    return orders.map(order => ({
      ...order,
      items: itemsByOrder[order._id.toString()] || [],
      address: addressMap[order.addressId.toString()] || null,
      payment: paymentsByOrder[order._id.toString()] || null,
    }));
  }

  async findOne(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId)
    }).lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const [items, payment, address] = await Promise.all([
      this.orderItemModel.find({ orderId: order._id }).lean(),
      this.paymentModel.findOne({ orderId: order._id }).lean(),
      this.addressModel.findById(order.addressId).lean(),
    ]);

    // Get product images
    const productIds = items.map(i => i.productId);
    const productImages = await this.productImageModel.find({
      productId: { $in: productIds }
    }).lean();

    const imagesByProduct = productImages.reduce((acc, img) => {
      const key = img.productId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {} as Record<string, any[]>);

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

  async cancelOrder(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId)
    }).lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Get order items
    const items = await this.orderItemModel.find({ orderId: order._id }).lean();

    // Update order status
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      { new: true }
    ).lean();

    // Restore stock
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: item.quantity } },
        { new: true }
      );
    }

    return updatedOrder;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  private calculateDeliveryCharge(district: string, subtotal: number): number {
    const freeDeliveryThreshold = Number(
      this.configService.get('FREE_DELIVERY_THRESHOLD', 2000),
    );

    if (subtotal >= freeDeliveryThreshold) {
      return 0;
    }

    const valleyDistricts = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
    const valleyCharge = Number(
      this.configService.get('VALLEY_DELIVERY_CHARGE', 100),
    );
    const outsideValleyCharge = Number(
      this.configService.get('OUTSIDE_VALLEY_CHARGE', 150),
    );

    return valleyDistricts.includes(district)
      ? valleyCharge
      : outsideValleyCharge;
  }

  private async calculateDiscount(
    couponCode: string,
    subtotal: number,
  ): Promise<number> {
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
    } else {
      discount = Number(coupon.discountValue);
    }

    await this.couponModel.findByIdAndUpdate(
      coupon._id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    return discount;
  }
}
