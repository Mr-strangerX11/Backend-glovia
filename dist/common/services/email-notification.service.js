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
var EmailNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailNotificationService = EmailNotificationService_1 = class EmailNotificationService {
    constructor() {
        this.logger = new common_1.Logger(EmailNotificationService_1.name);
        this.provider = process.env.EMAIL_PROVIDER || 'mock';
        this.transporter = null;
        if (this.provider === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
        }
    }
    async sendOrderConfirmedEmail(payload, adminEmail) {
        const subject = `Order Confirmed - ${payload.orderNumber}`;
        const html = this.buildOrderConfirmedHtml(payload);
        const fromName = process.env.SMTP_FROM_NAME || 'Glovia Nepal';
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
        const recipients = [payload.customerEmail, adminEmail].filter(Boolean).join(',');
        if (!recipients) {
            this.logger.warn('No recipients configured for order confirmation email');
            return;
        }
        if (this.provider === 'mock') {
            this.logger.log(`[MOCK EMAIL] To: ${recipients} | Subject: ${subject}`);
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✉️  EMAIL to ${recipients}`);
            console.log(`📧 Subject: ${subject}`);
            console.log(`📄 Body:\n${html}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return;
        }
        if (!this.transporter) {
            this.logger.warn('SMTP transporter not configured');
            return;
        }
        try {
            await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: recipients,
                subject,
                html,
            });
            this.logger.log(`Order confirmation email sent to ${recipients}`);
        }
        catch (error) {
            this.logger.error('Failed to send order confirmation email', error);
        }
    }
    buildOrderConfirmedHtml(payload) {
        const itemsHtml = payload.items
            .map((item) => `
          <tr>
            <td style="padding: 8px 0;">${item.name}</td>
            <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 0; text-align: right;">NPR ${item.price}</td>
            <td style="padding: 8px 0; text-align: right;">NPR ${item.total}</td>
          </tr>
        `)
            .join('');
        return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2 style="margin-bottom: 8px;">Order Confirmed 🎉</h2>
        <p>Hi ${payload.customerName}, your order has been confirmed.</p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Order नंबर:</strong> ${payload.orderNumber}</p>
          <p><strong>Payment Method:</strong> ${payload.paymentMethod}</p>
        </div>

        <h3>Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid #e5e7eb;">
              <th style="padding: 8px 0;">Product</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Price</th>
              <th style="padding: 8px 0; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 16px;">
          <p><strong>Subtotal:</strong> NPR ${payload.subtotal}</p>
          <p><strong>Discount:</strong> NPR ${payload.discount}</p>
          <p><strong>Delivery Charge:</strong> NPR ${payload.deliveryCharge}</p>
          <p style="font-size: 18px;"><strong>Total:</strong> NPR ${payload.total}</p>
        </div>

        <h3 style="margin-top: 20px;">Delivery Address</h3>
        <p style="margin: 0;"><strong>${payload.address.fullName}</strong></p>
        <p style="margin: 0;">${payload.address.phone}</p>
        <p style="margin: 0;">${payload.address.area}, Ward ${payload.address.wardNo}, ${payload.address.municipality}</p>
        <p style="margin: 0;">${payload.address.district}, ${payload.address.province}</p>
        ${payload.address.landmark ? `<p style="margin: 0;">Landmark: ${payload.address.landmark}</p>` : ''}

        <p style="margin-top: 20px;">Thank you for shopping with Glovia Nepal!</p>
      </div>
    `;
    }
};
exports.EmailNotificationService = EmailNotificationService;
exports.EmailNotificationService = EmailNotificationService = EmailNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailNotificationService);
//# sourceMappingURL=email-notification.service.js.map