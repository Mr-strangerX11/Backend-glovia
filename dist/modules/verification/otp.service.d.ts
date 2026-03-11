export declare class OtpService {
    private readonly logger;
    private readonly gateway;
    generateOtp(): string;
    sendOtp(phone: string, otp: string, purpose: string): Promise<boolean>;
    private sendViaSparrow;
    private sendViaNTC;
    private sendViaMock;
    private buildMessage;
}
export declare class EmailOtpService {
    private readonly logger;
    private readonly provider;
    private readonly allowMockFallback;
    private readonly isProduction;
    private transporter;
    private readonly smtpHost;
    private readonly smtpPort;
    private readonly smtpSecure;
    private readonly smtpUser;
    private readonly smtpPassword;
    private readonly smtpFromName;
    private readonly smtpFromEmail;
    private readonly sendgridApiKey;
    private readonly sendgridFromEmail;
    constructor();
    private hasSmtpConfig;
    private getProviderSequence;
    getDeliveryHealth(): Promise<{
        nodeEnv: string;
        configuredProvider: string;
        providerSequence: ("mock" | "smtp" | "sendgrid" | "ses")[];
        allowMockFallback: boolean;
        smtp: {
            configured: boolean;
            hostConfigured: boolean;
            port: number;
            secure: boolean;
            usernameConfigured: boolean;
            passwordConfigured: boolean;
            fromEmailConfigured: boolean;
            verified: boolean;
            verifyError: string;
        };
        sendgrid: {
            configured: boolean;
            fromEmailConfigured: boolean;
        };
        canAttemptRealDelivery: boolean;
    }>;
    sendEmailOtp(email: string, otp: string, purpose: string): Promise<boolean>;
    private sendViaSMTP;
    private sendViaSendGrid;
    private sendViaSES;
    private sendViaMock;
    private buildEmailContent;
}
