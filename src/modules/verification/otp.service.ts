import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * OTP Service abstraction
 * Supports multiple SMS gateways (Sparrow SMS, NTC, etc.)
 * Configure via environment variables
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly gateway = process.env.SMS_GATEWAY || 'mock'; // 'sparrow', 'ntc', 'mock'

  /**
   * Generate 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via configured SMS gateway
   */
  async sendOtp(phone: string, otp: string, purpose: string): Promise<boolean> {
    try {
      switch (this.gateway) {
        case 'sparrow':
          return await this.sendViaSparrow(phone, otp, purpose);
        case 'ntc':
          return await this.sendViaNTC(phone, otp, purpose);
        case 'mock':
        default:
          return this.sendViaMock(phone, otp, purpose);
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}:`, error);
      return false;
    }
  }

  /**
   * Sparrow SMS integration (Nepal)
   * https://sparrowsms.com/documentation.php
   */
  private async sendViaSparrow(phone: string, otp: string, purpose: string): Promise<boolean> {
    const token = process.env.SPARROW_SMS_TOKEN;
    const from = process.env.SPARROW_SMS_FROM || 'GloviaNepal';

    if (!token) {
      this.logger.warn('Sparrow SMS token not configured');
      return false;
    }

    const message = this.buildMessage(otp, purpose);

    // Sparrow SMS API call
    const response = await fetch('http://api.sparrowsms.com/v2/sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        from,
        to: phone,
        text: message,
      }),
    });

    const result = await response.json();
    this.logger.log(`Sparrow SMS response: ${JSON.stringify(result)}`);

    return result.response_code === 200;
  }

  /**
   * NTC SMS integration (Nepal Telecom)
   */
  private async sendViaNTC(phone: string, otp: string, purpose: string): Promise<boolean> {
    // Implement NTC SMS API integration
    this.logger.warn('NTC SMS gateway not implemented yet');
    return false;
  }

  /**
   * Mock SMS for development
   */
  private sendViaMock(phone: string, otp: string, purpose: string): boolean {
    const message = this.buildMessage(otp, purpose);
    this.logger.log(`[MOCK SMS] To: ${phone} | Message: ${message}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 SMS to ${phone}`);
    console.log(`📩 ${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return true;
  }

  /**
   * Build OTP message based on purpose
   */
  private buildMessage(otp: string, purpose: string): string {
    const templates = {
      phone_verification: `Your Glovia Nepal verification code is: ${otp}. Valid for 5 minutes.`,
      login: `Your Glovia Nepal login OTP is: ${otp}. Do not share with anyone.`,
      password_reset: `Your Glovia Nepal password reset code is: ${otp}. Valid for 5 minutes.`,
    };

    return templates[purpose] || `Your Glovia Nepal OTP is: ${otp}`;
  }
}

/**
 * Email OTP Service
 * Handles OTP delivery via email (SMTP, SendGrid, SES, or mock)
 */
@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);
  private readonly provider = process.env.EMAIL_PROVIDER || 'mock'; // 'smtp', 'sendgrid', 'ses', 'mock'
  private transporter: Transporter;

  constructor() {
    // Initialize SMTP transporter if provider is smtp
    if (this.provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Send OTP via email
   */
  async sendEmailOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'smtp':
          return await this.sendViaSMTP(email, otp, purpose);
        case 'sendgrid':
          return await this.sendViaSendGrid(email, otp, purpose);
        case 'ses':
          return await this.sendViaSES(email, otp, purpose);
        case 'mock':
        default:
          return this.sendViaMock(email, otp, purpose);
      }
    } catch (error) {
      this.logger.error(`Failed to send email OTP to ${email}:`, error);
      return false;
    }
  }

  /**
   * SMTP email integration (Gmail, Outlook, etc.)
   */
  private async sendViaSMTP(email: string, otp: string, purpose: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('SMTP transporter not configured');
      return false;
    }

    const { subject, html } = this.buildEmailContent(otp, purpose);
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'Glovia Nepal';

    if (!fromEmail) {
      this.logger.warn('SMTP_FROM_EMAIL or SMTP_USER not configured');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`SMTP error sending to ${email}:`, error);
      return false;
    }
  }

  /**
   * SendGrid email integration
   */
  private async sendViaSendGrid(email: string, otp: string, purpose: string): Promise<boolean> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.warn('SendGrid API key not configured');
      return false;
    }

    const { subject, html } = this.buildEmailContent(otp, purpose);

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@glovia.local', name: 'Glovia Nepal' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      return response.status === 202;
    } catch (error) {
      this.logger.error('SendGrid error:', error);
      return false;
    }
  }

  /**
   * AWS SES email integration
   */
  private async sendViaSES(email: string, otp: string, purpose: string): Promise<boolean> {
    // TODO: Implement AWS SES integration
    this.logger.warn('AWS SES not implemented yet');
    return false;
  }

  /**
   * Mock email for development
   */
  private sendViaMock(email: string, otp: string, purpose: string): boolean {
    const { subject, html } = this.buildEmailContent(otp, purpose);
    this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✉️  EMAIL to ${email}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📄 Body:\n${html}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return true;
  }

  /**
   * Build email content based on purpose
   */
  private buildEmailContent(otp: string, purpose: string): { subject: string; html: string } {
    const templates: Record<string, { subject: string; html: string }> = {
      email_verification: {
        subject: 'Verify your Glovia Nepal email address',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Welcome to Glovia Nepal! To complete your registration, please verify your email.</p>
            <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
            <p>Enter this code to verify your email. Valid for 5 minutes.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      },
      password_reset: {
        subject: 'Reset your Glovia Nepal password',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset</h2>
            <p>Use this code to reset your password:</p>
            <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
            <p>This code is valid for 5 minutes.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      },
    };

    return templates[purpose] || {
      subject: 'Glovia Nepal Verification Code',
      html: `<p>Your verification code: <strong>${otp}</strong></p>`,
    };
  }
}
