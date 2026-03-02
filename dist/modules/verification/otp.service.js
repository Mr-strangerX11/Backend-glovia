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
var OtpService_1, EmailOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOtpService = exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let OtpService = OtpService_1 = class OtpService {
    constructor() {
        this.logger = new common_1.Logger(OtpService_1.name);
        this.gateway = process.env.SMS_GATEWAY || 'mock';
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtp(phone, otp, purpose) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${phone}:`, error);
            return false;
        }
    }
    async sendViaSparrow(phone, otp, purpose) {
        const token = process.env.SPARROW_SMS_TOKEN;
        const from = process.env.SPARROW_SMS_FROM || 'GloviaNepal';
        if (!token) {
            this.logger.warn('Sparrow SMS token not configured');
            return false;
        }
        const message = this.buildMessage(otp, purpose);
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
    async sendViaNTC(phone, otp, purpose) {
        this.logger.warn('NTC SMS gateway not implemented yet');
        return false;
    }
    sendViaMock(phone, otp, purpose) {
        const message = this.buildMessage(otp, purpose);
        this.logger.log(`[MOCK SMS] To: ${phone} | Message: ${message}`);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📱 SMS to ${phone}`);
        console.log(`📩 ${message}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return true;
    }
    buildMessage(otp, purpose) {
        const templates = {
            phone_verification: `Your Glovia Nepal verification code is: ${otp}. Valid for 5 minutes.`,
            login: `Your Glovia Nepal login OTP is: ${otp}. Do not share with anyone.`,
            password_reset: `Your Glovia Nepal password reset code is: ${otp}. Valid for 5 minutes.`,
        };
        return templates[purpose] || `Your Glovia Nepal OTP is: ${otp}`;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)()
], OtpService);
let EmailOtpService = EmailOtpService_1 = class EmailOtpService {
    constructor() {
        this.logger = new common_1.Logger(EmailOtpService_1.name);
        this.provider = process.env.EMAIL_PROVIDER || 'mock';
        if (this.provider === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
        }
    }
    async sendEmailOtp(email, otp, purpose) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send email OTP to ${email}:`, error);
            return false;
        }
    }
    async sendViaSMTP(email, otp, purpose) {
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
        }
        catch (error) {
            this.logger.error(`SMTP error sending to ${email}:`, error);
            return false;
        }
    }
    async sendViaSendGrid(email, otp, purpose) {
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
        }
        catch (error) {
            this.logger.error('SendGrid error:', error);
            return false;
        }
    }
    async sendViaSES(email, otp, purpose) {
        this.logger.warn('AWS SES not implemented yet');
        return false;
    }
    sendViaMock(email, otp, purpose) {
        const { subject, html } = this.buildEmailContent(otp, purpose);
        this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✉️  EMAIL to ${email}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📄 Body:\n${html}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return true;
    }
    buildEmailContent(otp, purpose) {
        const templates = {
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
};
exports.EmailOtpService = EmailOtpService;
exports.EmailOtpService = EmailOtpService = EmailOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailOtpService);
//# sourceMappingURL=otp.service.js.map