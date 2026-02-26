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
            this.logger.error(`Failed to send order confirmation email.\nRecipients: ${recipients}\nSubject: ${subject}\nPayload: ${JSON.stringify(payload, null, 2)}`, error);
            throw error;
        }
    }
    buildOrderConfirmedHtml(payload) {
        const itemsHtml = payload.items
            .map((item) => `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f1f1;">${item.name}</td>
            <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.price}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.total}</td>
          </tr>
        `)
            .join('');
        return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: #1e293b; padding: 24px 0; text-align: center;">
              <img src="https://glovia.com.np/logo.png" alt="Glovia Nepal" style="height: 40px; margin-bottom: 8px;" />
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Glovia Nepal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px 16px 24px; color: #111;">
              <h2 style="margin-bottom: 8px; color: #16a34a; font-size: 22px;">Order Confirmed 🎉</h2>
              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <b>${payload.customerName}</b>, your order has been confirmed.</p>

              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 4px 0;"><strong>Order Number:</strong> ${payload.orderNumber}</p>
                <p style="margin: 0 0 4px 0;"><strong>Payment Method:</strong> ${payload.paymentMethod}</p>
              </div>

              <h3 style="margin: 24px 0 8px 0; font-size: 18px;">Order Items</h3>
              <table width="100%" style="border-collapse: collapse; background: #fff;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 12px 8px;">Product</th>
                    <th style="padding: 12px 8px; text-align: center;">Qty</th>
                    <th style="padding: 12px 8px; text-align: right;">Price</th>
                    <th style="padding: 12px 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 24px; font-size: 16px;">
                <p><strong>Subtotal:</strong> NPR ${payload.subtotal}</p>
                <p><strong>Discount:</strong> NPR ${payload.discount}</p>
                <p><strong>Delivery Charge:</strong> NPR ${payload.deliveryCharge}</p>
                <p style="font-size: 20px; color: #16a34a;"><strong>Total:</strong> NPR ${payload.total}</p>
              </div>

              <h3 style="margin-top: 32px; font-size: 18px;">Delivery Address</h3>
              <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
                <p style="margin: 0 0 4px 0;"><strong>${payload.address.fullName}</strong></p>
                <p style="margin: 0 0 4px 0;">${payload.address.phone}</p>
                <p style="margin: 0 0 4px 0;">${payload.address.area}, Ward ${payload.address.wardNo}, ${payload.address.municipality}</p>
                <p style="margin: 0 0 4px 0;">${payload.address.district}, ${payload.address.province}</p>
                ${payload.address.landmark ? `<p style=\"margin: 0 0 4px 0;\">Landmark: ${payload.address.landmark}</p>` : ''}
              </div>

              <p style="margin-top: 32px; font-size: 16px; color: #64748b;">Thank you for shopping with <b>Glovia Nepal</b>!<br/>If you have any questions, reply to this email or contact our support.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 16px; color: #64748b; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Glovia Nepal. All rights reserved.
            </td>
          </tr>
        </table>
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