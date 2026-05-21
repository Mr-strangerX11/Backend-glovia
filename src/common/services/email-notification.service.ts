import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  vendorName?: string;
  vendorId?: string;
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
  isAdminEmail?: boolean;
}

interface OrderStatusEmailPayload {
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  updatedAt?: Date;
}

interface VendorOrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface VendorOrderEmailPayload {
  orderNumber: string;
  vendorName: string;
  vendorEmail: string;
  customerName: string;
  customerPhone: string;
  items: VendorOrderItem[];
  subtotal: number;
  deliveryAddress: OrderEmailAddress;
}

interface SuperAdminOrderEmailPayload {
  orderNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    vendorName?: string;
  }>;
  address: OrderEmailAddress;
  vendors: Array<{
    vendorName: string;
    vendorEmail: string;
    subtotal: number;
  }>;
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly provider = process.env.EMAIL_PROVIDER || 'mock';
  private transporter: Transporter | null = null;

  constructor() {
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

  async sendOrderConfirmedEmail(payload: OrderEmailPayload, adminEmail?: string): Promise<void> {
    const subject = `Order Confirmed - ${payload.orderNumber}`;
    const html = this.buildOrderConfirmedHtml(payload);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
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
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email.\nRecipients: ${recipients}\nSubject: ${subject}\nPayload: ${JSON.stringify(payload, null, 2)}`,
        error as Error
      );
      // Optionally, rethrow to let upstream handle notification failures
      throw error;
    }
  }

  async sendSuperAdminOrderEmail(payload: SuperAdminOrderEmailPayload): Promise<void> {
    const subject = `📊 New Order - ${payload.orderNumber} | ${payload.customerName}`;
    const html = this.buildSuperAdminOrderHtml(payload);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'glovianepal@gmail.com';

    if (!superAdminEmail) {
      this.logger.warn('Super admin email not configured');
      return;
    }

    if (this.provider === 'mock') {
      this.logger.log(`[MOCK EMAIL] To: ${superAdminEmail} | Subject: ${subject}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✉️  SUPER ADMIN EMAIL to ${superAdminEmail}`);
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
        to: superAdminEmail,
        subject,
        html,
      });
      this.logger.log(`Super admin order email sent to ${superAdminEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send super admin order email.\nRecipient: ${superAdminEmail}\nSubject: ${subject}`,
        error as Error
      );
      throw error;
    }
  }

  async sendOrderStatusChangedEmail(payload: OrderStatusEmailPayload): Promise<void> {
    const subject = `Order Update - ${payload.orderNumber} is ${payload.status}`;
    const html = this.buildOrderStatusChangedHtml(payload);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
    const recipients = payload.customerEmail;

    if (!recipients) {
      this.logger.warn('No customer recipient configured for order status email');
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
      this.logger.log(`Order status email sent to ${recipients}`);
    } catch (error) {
      this.logger.error(
        `Failed to send order status email.\nRecipients: ${recipients}\nSubject: ${subject}\nPayload: ${JSON.stringify(payload, null, 2)}`,
        error as Error,
      );
      throw error;
    }
  }

  private buildOrderConfirmedHtml(payload: OrderEmailPayload): string {
    // Simple product list without vendor info
    const itemsHtml = payload.items
      .map(item => `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #f1f1f1;">${item.name}</td>
          <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.price}</td>
          <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.total}</td>
        </tr>
      `)
      .join('');

    // Responsive and branded email template
    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: #1e293b; padding: 24px 0; text-align: center;">
              <img src="https://glovia.com.np/logo.png" alt="Glovia Market place" style="height: 40px; margin-bottom: 8px;" />
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Glovia Market place</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px 16px 24px; color: #111;">
              <h2 style="margin-bottom: 8px; color: #16a34a; font-size: 22px;">Order Confirmed 🎉</h2>
              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <b>${payload.customerName}</b>, your order has been confirmed.</p>

              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 4px 0;"><strong>Order Number:</strong> ${payload.orderNumber}</p>
                <p style="margin: 0;"><strong>Payment Method:</strong> ${payload.paymentMethod}</p>
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

              <h3 style="margin-top: 32px; font-size: 18px;">📍 Delivery Address</h3>
              <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
                <p style="margin: 0 0 4px 0;"><strong>${payload.address.fullName}</strong></p>
                <p style="margin: 0 0 4px 0;">${payload.address.phone}</p>
                <p style="margin: 0 0 4px 0;">${payload.address.area}, Ward ${payload.address.wardNo}, ${payload.address.municipality}</p>
                <p style="margin: 0 0 4px 0;">${payload.address.district}, ${payload.address.province}</p>
                ${payload.address.landmark ? `<p style=\"margin: 0 0 4px 0;\">Landmark: ${payload.address.landmark}</p>` : ''}
              </div>

              <p style="margin-top: 32px; font-size: 16px; color: #64748b;">Thank you for shopping with <b>Glovia Market place</b>!<br/>If you have any questions, reply to this email or contact our support.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 16px; color: #64748b; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  private buildSuperAdminOrderHtml(payload: SuperAdminOrderEmailPayload): string {
    // Group items by vendor
    const itemsByVendor = new Map<string, any[]>();
    payload.items.forEach(item => {
      const vendorKey = item.vendorName || 'System';
      if (!itemsByVendor.has(vendorKey)) {
        itemsByVendor.set(vendorKey, []);
      }
      itemsByVendor.get(vendorKey).push(item);
    });

    // Generate vendor sections
    const vendorSections = Array.from(itemsByVendor.entries())
      .map(([vendorName, vendorItems], index) => {
        const vendorColor = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'][index % 5];
        
        const itemsRows = vendorItems
          .map(item => `
            <tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid #f1f1f1;">${item.name}</td>
              <td style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.quantity}</td>
              <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.price}</td>
              <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.total}</td>
            </tr>
          `)
          .join('');

        const vendorInfo = payload.vendors.find(v => v.vendorName === vendorName);
        const vendorSubtotal = vendorInfo?.subtotal || vendorItems.reduce((sum, item) => sum + item.total, 0);

        return `
          <div style="margin-bottom: 20px; border: 2px solid ${vendorColor}; border-radius: 8px; overflow: hidden;">
            <div style="background: ${vendorColor}; color: white; padding: 12px 16px;">
              <strong style="font-size: 16px;">🏪 ${vendorName}</strong><br/>
              <small>Email: ${vendorInfo?.vendorEmail || 'N/A'}</small>
            </div>
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
                ${itemsRows}
              </tbody>
            </table>
            <div style="background: #f8fafc; padding: 12px 16px; text-align: right;">
              <strong style="color: ${vendorColor};">Vendor Subtotal: NPR ${vendorSubtotal}</strong>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 700px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px 0; text-align: center;">
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">📊 SUPER ADMIN - Order Dashboard</h1>
              <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 14px;">New Order Received & Processing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <strong style="color: #92400e;">⚡ Quick Overview</strong><br/>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #b45309;">Order #${payload.orderNumber} | ${payload.vendors.length} vendor(s) | NPR ${payload.total}</p>
              </div>

              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">👤 Customer Information</h2>
              <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${payload.customerName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${payload.customerEmail}</p>
                <p style="margin: 0;"><strong>Phone:</strong> ${payload.customerPhone}</p>
              </div>

              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">📍 Delivery Address</h2>
              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0;"><strong>${payload.address.fullName}</strong></p>
                <p style="margin: 0 0 8px 0;">${payload.address.phone}</p>
                <p style="margin: 0 0 8px 0;">${payload.address.area}, Ward ${payload.address.wardNo}</p>
                <p style="margin: 0 0 8px 0;">${payload.address.municipality}, ${payload.address.district}</p>
                <p style="margin: 0;"><strong>Province:</strong> ${payload.address.province}</p>
                ${payload.address.landmark ? `<p style="margin: 8px 0 0 0;"><strong>Landmark:</strong> ${payload.address.landmark}</p>` : ''}
              </div>

              <h2 style="color: #1e293b; margin: 24px 0 16px 0; font-size: 20px;">🏪 Products by Vendor</h2>
              ${vendorSections}

              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
                  <strong>Subtotal:</strong>
                  <span>NPR ${payload.subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
                  <strong>Discount:</strong>
                  <span>- NPR ${payload.discount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
                  <strong>Delivery Charge:</strong>
                  <span>+ NPR ${payload.deliveryCharge}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px;">
                  <strong style="color: #16a34a;">Total Amount:</strong>
                  <strong style="color: #16a34a;">NPR ${payload.total}</strong>
                </div>
              </div>

              <div style="background: #fecaca; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin-top: 24px;">
                <p style="margin: 0;"><strong>⚠️ Action Items:</strong></p>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                  <li>Verify order payment status</li>
                  <li>Confirm vendor notification emails sent</li>
                  <li>Monitor order fulfillment progress</li>
                  <li>Track delivery status</li>
                </ul>
              </div>

              <p style="margin-top: 24px; font-size: 14px; color: #64748b; text-align: center;">
                <strong>Order Method:</strong> ${payload.paymentMethod}<br/>
                Generated: ${new Date().toLocaleString()}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #1e293b; text-align: center; padding: 16px; color: #cbd5e1; font-size: 13px;">
              Glovia Market place Admin Dashboard | ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  private buildOrderStatusChangedHtml(payload: OrderStatusEmailPayload): string {
    const statusMessages: Record<string, string> = {
      PENDING: 'We have received your order and will process it shortly.',
      CONFIRMED: 'Your order has been confirmed and is now being prepared.',
      PROCESSING: 'Your order is currently being prepared for shipment.',
      SHIPPED: 'Great news! Your order is on the way.',
      DELIVERED: 'Your order has been delivered. Enjoy your purchase!',
      CANCELLED: 'Your order has been cancelled. If this was unexpected, please contact support.',
      RETURNED: 'Your order has been marked as returned.',
    };

    const statusMessage = statusMessages[payload.status] || 'Your order status has been updated.';
    const updatedAtText = payload.updatedAt ? new Date(payload.updatedAt).toLocaleString() : new Date().toLocaleString();

    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: #1e293b; padding: 24px 0; text-align: center;">
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Glovia Market place</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px 16px 24px; color: #111;">
              <h2 style="margin-bottom: 8px; color: #2563eb; font-size: 22px;">Order Status Updated</h2>
              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <b>${payload.customerName || 'Customer'}</b>,</p>
              <p style="font-size: 15px; margin: 0 0 18px 0;">${statusMessage}</p>

              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 6px 0;"><strong>Order Number:</strong> ${payload.orderNumber}</p>
                <p style="margin: 0 0 6px 0;"><strong>Current Status:</strong> ${payload.status}</p>
                <p style="margin: 0 0 6px 0;"><strong>Updated At:</strong> ${updatedAtText}</p>
                <p style="margin: 0 0 6px 0;"><strong>Tracking Number:</strong> ${payload.trackingNumber || 'Not assigned yet'}</p>
                <p style="margin: 0;"><strong>Delivery Partner:</strong> ${payload.deliveryPartner || 'Pending assignment'}</p>
              </div>

              <p style="margin-top: 24px; font-size: 15px; color: #64748b;">Need help? Reply to this email or contact our support team.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 16px; color: #64748b; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  async sendVendorOrderEmailAsync(payload: VendorOrderEmailPayload): Promise<void> {
    const subject = `New Order - ${payload.orderNumber}`;
    const html = this.buildVendorOrderHtml(payload);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
    const recipients = payload.vendorEmail;

    if (!recipients) {
      this.logger.warn('No vendor recipient configured for vendor order email');
      return;
    }

    if (this.provider === 'mock') {
      this.logger.log(`[MOCK EMAIL] To: ${recipients} | Subject: ${subject}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✉️  VENDOR EMAIL to ${recipients}`);
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
      this.logger.log(`Vendor order email sent to ${recipients}`);
    } catch (error) {
      this.logger.error(
        `Failed to send vendor order email.\nRecipients: ${recipients}\nSubject: ${subject}\nPayload: ${JSON.stringify(payload, null, 2)}`,
        error as Error,
      );
      throw error;
    }
  }

  private buildVendorOrderHtml(payload: VendorOrderEmailPayload): string {
    const itemsHtml = payload.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f1f1;">${item.name}</td>
            <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.price}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.total}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 0; text-align: center;">
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Glovia Market place</h1>
              <p style="color: #fff; margin: 4px 0 0 0; font-size: 14px;">Vendor Hub</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px 16px 24px; color: #111;">
              <h2 style="margin-bottom: 8px; color: #2563eb; font-size: 22px;">📦 New Order Received</h2>
              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <b>${payload.vendorName}</b>, you have a new order!</p>

              <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 4px 0;"><strong>Order Number:</strong> ${payload.orderNumber}</p>
                <p style="margin: 0 0 4px 0;"><strong>Customer:</strong> ${payload.customerName}</p>
                <p style="margin: 0;"><strong>Contact:</strong> ${payload.customerPhone}</p>
              </div>

              <h3 style="margin: 24px 0 8px 0; font-size: 18px;">Your Products in this Order</h3>
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

              <div style="margin-top: 24px; background: #f8fafc; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; text-align: right;"><strong>Subtotal from your items:</strong> NPR ${payload.subtotal}</p>
              </div>

              <h3 style="margin-top: 32px; font-size: 18px;">📤 Customer Delivery Info</h3>
              <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
                <p style="margin: 0 0 4px 0;"><strong>${payload.deliveryAddress.fullName}</strong></p>
                <p style="margin: 0;"><strong>Phone:</strong> ${payload.deliveryAddress.phone}</p>
              </div>
              </div>

              <div style="margin-top: 32px; background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; font-size: 15px;"><strong>✅ Action Required:</strong> Please prepare and ship this order within 24 hours. Keep the customer updated!</p>
              </div>

              <p style="margin-top: 24px; font-size: 15px; color: #64748b;">Thank you for being a valued vendor partner on <b>Glovia Market place</b>!<br/>Login to your vendor dashboard to manage this order.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 16px; color: #64748b; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  async sendNewsletterSubscriptionEmail(customerEmail: string, customerName?: string): Promise<void> {
    const subject = '🎉 Welcome to Glovia Rewards! Your Exclusive Promo Code Inside';
    const html = this.buildNewsletterSubscriptionHtml(customerEmail, customerName);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
    const recipients = customerEmail;

    if (!recipients) {
      this.logger.warn('No customer email configured for newsletter subscription');
      return;
    }

    if (this.provider === 'mock') {
      this.logger.log(`[MOCK EMAIL] Newsletter subscription to ${recipients}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✉️  NEWSLETTER EMAIL to ${recipients}`);
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
      this.logger.log(`Newsletter subscription email sent to ${recipients}`);
    } catch (error) {
      this.logger.error(
        `Failed to send newsletter subscription email.\nRecipients: ${recipients}\nSubject: ${subject}`,
        error as Error,
      );
      throw error;
    }
  }

  private buildNewsletterSubscriptionHtml(email: string, name?: string): string {
    const displayName = name || email.split('@')[0];

    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 24px; text-align: center;">
              <h1 style="color: #fff; font-size: 28px; margin: 0 0 8px 0; letter-spacing: 0.5px;">🎉 Welcome!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">You're now part of Glovia Rewards</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 16px; color: #1f2937; margin: 0 0 24px 0;">Hi <strong>${displayName}</strong>,</p>

              <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for subscribing to Glovia! We're thrilled to have you join our community of beauty & wellness enthusiasts. 
              </p>

              <!-- Promo Code Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Exclusive Welcome Offer</p>
                <p style="color: #fff; font-size: 14px; margin: 0 0 8px 0;">Use this code at checkout:</p>
                <div style="background: rgba(255,255,255,0.15); border: 2px dashed rgba(255,255,255,0.3); padding: 16px; border-radius: 8px; margin: 12px 0;">
                  <p style="color: #fff; font-size: 32px; font-weight: bold; margin: 0; font-family: monospace; letter-spacing: 2px;">SUB-GLOVIA</p>
                </div>
                <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 12px 0 0 0;">✨ Exclusive subscriber-only promo code</p>
              </div>

              <!-- Benefits -->
              <h3 style="font-size: 16px; color: #1f2937; margin: 28px 0 16px 0;">What You'll Get:</h3>
              <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
                <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 16px; margin-right: 10px;">💝</span>
                  <span style="color: #4b5563; font-size: 15px;">Exclusive deals & first-buyer offers</span>
                </li>
                <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 16px; margin-right: 10px;">🎁</span>
                  <span style="color: #4b5563; font-size: 15px;">Loyalty point updates & referral bonuses</span>
                </li>
                <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 16px; margin-right: 10px;">⚡</span>
                  <span style="color: #4b5563; font-size: 15px;">Flash sale alerts delivered straight to your inbox</span>
                </li>
                <li style="padding: 10px 0;">
                  <span style="font-size: 16px; margin-right: 10px;">✅</span>
                  <span style="color: #4b5563; font-size: 15px;">Early access to new product launches</span>
                </li>
              </ul>

              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://glovia.com.np/products" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; transition: transform 0.2s;">
                  Start Shopping Now →
                </a>
              </div>

              <!-- Trust Message -->
              <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #0c4a6e; font-size: 13px; margin: 0 0 8px 0;"><strong>📧 No Spam, Ever</strong></p>
                <p style="color: #64748b; font-size: 13px; margin: 0;">We send only curated deals, seasonal offers, and important updates. Unsubscribe anytime with one click.</p>
              </div>

              <p style="font-size: 14px; color: #64748b; margin: 24px 0 0 0;">
                Happy shopping,<br/>
                <strong style="color: #667eea;">The Glovia Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 12px 0;">
                &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                <a href="http://glovia.com.np/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
                <a href="http://glovia.com.np/terms" style="color: #667eea; text-decoration: none;">Terms & Conditions</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  async sendVerificationEmail(customerEmail: string, customerName: string, userId: string): Promise<void> {
    const subject = '✉️ Verify Your Email Address - Glovia Market place';
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email/${userId}`;
    const html = this.buildVerificationEmailHtml(customerName, verificationLink);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';
    const recipients = customerEmail;

    if (!recipients) {
      this.logger.warn('No customer email configured for verification email');
      return;
    }

    if (this.provider === 'mock') {
      this.logger.log(`[MOCK EMAIL] Verification email to ${recipients}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✉️  VERIFICATION EMAIL to ${recipients}`);
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
      this.logger.log(`Verification email sent to ${recipients}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email.\nRecipients: ${recipients}\nSubject: ${subject}`,
        error as Error,
      );
      throw error;
    }
  }

  private buildVerificationEmailHtml(customerName: string, verificationLink: string): string {
    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
              <img src="https://glovia.com.np/logo.png" alt="Glovia Market place" style="height: 40px; margin-bottom: 12px;" />
              <h1 style="color: #fff; font-size: 28px; margin: 0; letter-spacing: 1px;">Glovia Market place</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px; color: #1e293b;">
              <h2 style="margin: 0 0 16px 0; color: #2563eb; font-size: 24px;">Verify Your Email Address</h2>
              
              <p style="font-size: 16px; margin: 0 0 24px 0; color: #475569;">
                Hi <strong>${customerName}</strong>,
              </p>

              <p style="font-size: 15px; margin: 0 0 32px 0; color: #64748b; line-height: 1.6;">
                Thank you for creating an account with Glovia Market place! To complete your registration and unlock all features, please verify your email address by clicking the button below.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #fff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                  ✓ Verify Email Address
                </a>
              </div>

              <!-- Alternative Link -->
              <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 32px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
                  <strong>Or copy and paste this link in your browser:</strong>
                </p>
                <p style="margin: 0; font-size: 12px; color: #2563eb; word-break: break-all; font-family: monospace;">
                  ${verificationLink}
                </p>
              </div>

              <!-- Info Box -->
              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 32px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  ⏱️ <strong>This verification link will expire in 24 hours.</strong>
                </p>
              </div>

              <!-- Features After Verification -->
              <div style="margin: 32px 0;">
                <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">
                  <strong>After verification, you'll be able to:</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px;">
                  <li style="margin-bottom: 8px;">✅ Place and track orders</li>
                  <li style="margin-bottom: 8px;">✅ Save addresses and preferences</li>
                  <li style="margin-bottom: 8px;">✅ Access loyalty rewards</li>
                  <li style="margin-bottom: 8px;">✅ Receive exclusive offers</li>
                  <li style="margin-bottom: 8px;">✅ Build your trust score</li>
                </ul>
              </div>

              <!-- Help Text -->
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 32px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #166534;">
                  <strong>Didn't request this email?</strong>
                </p>
                <p style="margin: 0; font-size: 13px; color: #4d7c0f;">
                  If you didn't create a Glovia Market place account, please ignore this email. Your email address won't be added to our system unless you verify it.
                </p>
              </div>

              <p style="margin: 32px 0 0 0; font-size: 14px; color: #94a3b8;">
                Best regards,<br/>
                <strong style="color: #667eea;">The Glovia Market place Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 12px 0;">
                &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                <a href="http://glovia.com.np/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
                <a href="http://glovia.com.np/terms" style="color: #667eea; text-decoration: none;">Terms & Conditions</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Send order notification to vendor (only their products)
   */
  async sendVendorOrderNotificationEmail(
    vendorEmail: string,
    vendorName: string,
    orderData: {
      orderId: string;
      orderNumber: string;
      orderDate: Date;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      items: any[];
      vendorTotal: number;
      paymentMethod: string;
    },
  ): Promise<void> {
    const subject = `New Order Received for Your Product - Order #${orderData.orderNumber}`;
    const html = this.buildVendorOrderNotificationHtml(vendorName, orderData);

    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Market place';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@glovia.local';

    if (!vendorEmail) {
      this.logger.warn('No vendor email configured for vendor order notification');
      return;
    }

    if (this.provider === 'mock') {
      this.logger.log(`[MOCK EMAIL] Vendor order notification to ${vendorEmail}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 VENDOR ORDER EMAIL to ${vendorEmail}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📄 Body:\n${html}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    if (!this.transporter) {
      this.logger.warn('SMTP transporter not configured for vendor email');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: vendorEmail,
        subject,
        html,
      });
      this.logger.log(`Vendor order notification email sent to ${vendorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send vendor order notification email.\nVendor: ${vendorEmail}\nOrder: ${orderData.orderNumber}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Build vendor order notification HTML email
   */
  private buildVendorOrderNotificationHtml(vendorName: string, orderData: any): string {
    const itemsHtml = (orderData.items || [])
      .map(
        (item: any) => `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f1f1;">${item.productName || item.name}</td>
            <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.price}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">NPR ${item.total}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <div style="background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: Arial, sans-serif;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 0; text-align: center;">
              <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Glovia Market place</h1>
              <p style="color: #fff; margin: 4px 0 0 0; font-size: 14px;">Vendor Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px 16px 24px; color: #111;">
              <h2 style="margin-bottom: 8px; color: #16a34a; font-size: 22px;">📦 New Order Received</h2>
              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <b>${vendorName}</b>, you have a new order!</p>

              <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 4px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p style="margin: 0 0 4px 0;"><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleString()}</p>
                <p style="margin: 0;"><strong>Customer:</strong> ${orderData.customerName}</p>
              </tr>

              <h3 style="margin: 24px 0 8px 0; font-size: 18px;">Your Products</h3>
              <table width="100%" style="border-collapse: collapse; background: #fff;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 12px 8px;">Product</th>
                    <th style="padding: 12px 8px; text-align: center;">Qty</th>
                    <th style="padding: 12px 8px; text-align: right;">Price</th>
                    <th style="padding: 12px 8px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 24px; background: #f8fafc; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; text-align: right;"><strong>Your Total:</strong> NPR ${orderData.vendorTotal}</p>
              </div>

              <h3 style="margin-top: 32px; font-size: 18px;">Customer Details</h3>
              <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
                <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ${orderData.customerName}</p>
                <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${orderData.customerEmail}</p>
                <p style="margin: 0;"><strong>Phone:</strong> ${orderData.customerPhone}</p>
              </div>

              <div style="margin-top: 32px; background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; font-size: 15px;"><strong>✅ Action Required:</strong> Please prepare and ship these items within 24 hours. Keep the customer updated about the status!</p>
              </div>

              <p style="margin-top: 24px; font-size: 15px; color: #64748b;">Thank you for being a valued vendor partner!<br/>Login to your vendor dashboard to manage this order.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 16px; color: #64748b; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Glovia Market place. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}
