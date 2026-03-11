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
        const from = process.env.SPARROW_SMS_FROM || 'gloviaMarket';
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
            phone_verification: `Your glovia Market place verification code is: ${otp}. Valid for 5 minutes.`,
            login: `Your glovia Market place login OTP is: ${otp}. Do not share with anyone.`,
            password_reset: `Your glovia Market place password reset code is: ${otp}. Valid for 5 minutes.`,
        };
        return templates[purpose] || `Your glovia Market place OTP is: ${otp}`;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)()
], OtpService);
let EmailOtpService = EmailOtpService_1 = class EmailOtpService {
    constructor() {
        this.logger = new common_1.Logger(EmailOtpService_1.name);
        this.provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
        this.allowMockFallback = process.env.EMAIL_ALLOW_MOCK_FALLBACK === 'true';
        this.isProduction = process.env.NODE_ENV === 'production';
        this.transporter = null;
        this.smtpHost = process.env.SMTP_HOST;
        this.smtpPort = parseInt(process.env.SMTP_PORT || '587');
        this.smtpSecure = process.env.SMTP_SECURE === 'true';
        this.smtpUser = process.env.SMTP_USER || process.env.SMTP_USERNAME;
        this.smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
        this.smtpFromName = process.env.SMTP_FROM_NAME || 'glovia Market place';
        this.smtpFromEmail = process.env.SMTP_FROM_EMAIL || this.smtpUser;
        this.sendgridApiKey = process.env.SENDGRID_API_KEY;
        this.sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || this.smtpFromEmail || 'noreply@glovia.local';
        if (this.hasSmtpConfig()) {
            this.transporter = nodemailer.createTransport({
                host: this.smtpHost,
                port: this.smtpPort,
                secure: this.smtpSecure,
                auth: {
                    user: this.smtpUser,
                    pass: this.smtpPassword,
                },
            });
        }
    }
    hasSmtpConfig() {
        return !!(this.smtpHost && this.smtpUser && this.smtpPassword);
    }
    getProviderSequence() {
        const configured = [];
        if (this.provider === 'smtp' || this.provider === 'sendgrid' || this.provider === 'ses' || this.provider === 'mock') {
            configured.push(this.provider);
        }
        if (this.hasSmtpConfig() && !configured.includes('smtp'))
            configured.push('smtp');
        if (this.sendgridApiKey && !configured.includes('sendgrid'))
            configured.push('sendgrid');
        if (!configured.includes('ses') && this.provider === 'ses')
            configured.push('ses');
        if (configured.length === 0 || this.provider === 'mock' || this.allowMockFallback || !this.isProduction) {
            configured.push('mock');
        }
        return configured;
    }
    async getDeliveryHealth() {
        let smtpVerified = null;
        let smtpVerifyError = null;
        if (this.transporter) {
            try {
                const verifyPromise = this.transporter.verify();
                smtpVerified = await Promise.race([
                    verifyPromise,
                    new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
                ]);
                if (!smtpVerified) {
                    smtpVerifyError = 'SMTP verify timeout or failed';
                }
            }
            catch (error) {
                smtpVerified = false;
                smtpVerifyError = error?.message || 'SMTP verify failed';
            }
        }
        const providers = this.getProviderSequence();
        return {
            nodeEnv: process.env.NODE_ENV || 'development',
            configuredProvider: this.provider || 'auto',
            providerSequence: providers,
            allowMockFallback: this.allowMockFallback,
            smtp: {
                configured: this.hasSmtpConfig(),
                hostConfigured: !!this.smtpHost,
                port: this.smtpPort,
                secure: this.smtpSecure,
                usernameConfigured: !!this.smtpUser,
                passwordConfigured: !!this.smtpPassword,
                fromEmailConfigured: !!this.smtpFromEmail,
                verified: smtpVerified,
                verifyError: smtpVerifyError,
            },
            sendgrid: {
                configured: !!this.sendgridApiKey,
                fromEmailConfigured: !!this.sendgridFromEmail,
            },
            canAttemptRealDelivery: providers.some((provider) => provider === 'smtp' || provider === 'sendgrid' || provider === 'ses'),
        };
    }
    async sendEmailOtp(email, otp, purpose) {
        const providers = this.getProviderSequence();
        for (const provider of providers) {
            try {
                switch (provider) {
                    case 'smtp':
                        if (await this.sendViaSMTP(email, otp, purpose)) {
                            return true;
                        }
                        break;
                    case 'sendgrid':
                        if (await this.sendViaSendGrid(email, otp, purpose)) {
                            return true;
                        }
                        break;
                    case 'ses':
                        if (await this.sendViaSES(email, otp, purpose)) {
                            return true;
                        }
                        break;
                    case 'mock':
                        if (this.sendViaMock(email, otp, purpose)) {
                            return true;
                        }
                        break;
                    default:
                        break;
                }
            }
            catch (error) {
                this.logger.error(`Email provider ${provider} failed for ${email}:`, error);
            }
        }
        this.logger.error(`Failed to send email OTP to ${email} via providers: ${providers.join(', ')}`);
        return false;
    }
    async sendViaSMTP(email, otp, purpose) {
        if (!this.transporter) {
            this.logger.warn('SMTP transporter not configured');
            return false;
        }
        const { subject, html } = this.buildEmailContent(otp, purpose);
        const fromEmail = this.smtpFromEmail;
        const fromName = this.smtpFromName;
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
            const acceptedCount = Array.isArray(info.accepted) ? info.accepted.length : 0;
            const rejectedCount = Array.isArray(info.rejected) ? info.rejected.length : 0;
            if (acceptedCount === 0 || rejectedCount > 0) {
                this.logger.error(`SMTP accepted=${acceptedCount}, rejected=${rejectedCount} for ${email}`);
                return false;
            }
            this.logger.log(`Email accepted by SMTP for ${email}: ${info.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`SMTP error sending to ${email}:`, error);
            return false;
        }
    }
    async sendViaSendGrid(email, otp, purpose) {
        const apiKey = this.sendgridApiKey;
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
                    from: { email: this.sendgridFromEmail, name: this.smtpFromName },
                    subject,
                    content: [{ type: 'text/html', value: html }],
                }),
            });
            if (response.status !== 202) {
                const text = await response.text();
                this.logger.error(`SendGrid rejected email (${response.status}) for ${email}: ${text}`);
                return false;
            }
            this.logger.log(`Email accepted by SendGrid for ${email}`);
            return true;
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
        if (this.isProduction && !this.allowMockFallback) {
            this.logger.error('Mock email fallback is disabled in production');
            return false;
        }
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
                subject: 'Verify your glovia Market place email address',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Welcome to glovia Market place! To complete your registration, please verify your email.</p>
            <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
            <p>Enter this code to verify your email. Valid for 5 minutes.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
            },
            password_reset: {
                subject: 'Reset your glovia Market place password',
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
            subject: 'glovia Market place Verification Code',
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