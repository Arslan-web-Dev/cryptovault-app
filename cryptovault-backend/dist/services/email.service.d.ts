export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    template?: string;
    templateData?: Record<string, any>;
}
export interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    htmlTemplate: string;
    textTemplate: string;
    variables: string[];
}
declare class EmailService {
    private transporter;
    private readonly templates;
    constructor();
    private initializeTemplates;
    sendEmail(options: EmailOptions): Promise<void>;
    sendWelcomeEmail(email: string, fullName: string, verificationLink: string): Promise<void>;
    sendTransactionConfirmation(email: string, transactionData: {
        type: string;
        status: string;
        amount: string;
        coinType: string;
        transactionHash: string;
        fromAddress: string;
        toAddress: string;
        fee: string;
        date: string;
        estimatedTime?: string;
    }): Promise<void>;
    sendSecurityAlert(email: string, securityData: {
        action: string;
        ipAddress: string;
        location: string;
        userAgent: string;
        timestamp: string;
        wasThisYou?: boolean;
    }): Promise<void>;
    sendCustomEmail(to: string | string[], subject: string, htmlContent: string, textContent?: string): Promise<void>;
    sendBulkEmail(recipients: string[], subject: string, htmlContent: string, textContent?: string): Promise<{
        sent: number;
        failed: number;
        errors: string[];
    }>;
    verifyEmailConfiguration(): Promise<boolean>;
    private processTemplate;
    getAvailableTemplates(): NotificationTemplate[];
    addTemplate(template: NotificationTemplate): void;
    removeTemplate(templateId: string): boolean;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map