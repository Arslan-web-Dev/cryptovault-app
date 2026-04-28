import nodemailer from 'nodemailer';
import { createError } from '../middleware/error.middleware';

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

class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: process.env['SMTP_SECURE'] === 'true',
      auth: {
        user: process.env['SMTP_USER'] || '',
        pass: process.env['SMTP_PASS'] || ''
      }
    });

    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to CryptoVault Pro! 🚀',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CryptoVault Pro</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CryptoVault Pro!</h1>
              <p>Your journey into cryptocurrency starts here</p>
            </div>
            <div class="content">
              <h2>Hi {{fullName}},</h2>
              <p>Thank you for joining CryptoVault Pro! We're excited to have you on board.</p>
              <p>With your new account, you can:</p>
              <ul>
                <li>Create and manage multiple cryptocurrency wallets</li>
                <li>Send, receive, and swap digital assets</li>
                <li>Track your portfolio in real-time</li>
                <li>Earn rewards through staking</li>
                <li>Refer friends and earn bonuses</li>
              </ul>
              <p>To get started, please verify your email address by clicking the button below:</p>
              <a href="{{verificationLink}}" class="button">Verify Email Address</a>
              <p>If you didn't create an account, please ignore this email.</p>
              <p>Best regards,<br>The CryptoVault Pro Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CryptoVault Pro. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Welcome to CryptoVault Pro!

        Hi {{fullName}},

        Thank you for joining CryptoVault Pro! We're excited to have you on board.

        With your new account, you can:
        - Create and manage multiple cryptocurrency wallets
        - Send, receive, and swap digital assets
        - Track your portfolio in real-time
        - Earn rewards through staking
        - Refer friends and earn bonuses

        To get started, please verify your email address: {{verificationLink}}

        If you didn't create an account, please ignore this email.

        Best regards,
        The CryptoVault Pro Team
      `,
      variables: ['fullName', 'verificationLink']
    });

    // Transaction confirmation template
    this.templates.set('transaction', {
      id: 'transaction',
      name: 'Transaction Confirmation',
      subject: 'Transaction Confirmation - {{type}} {{amount}} {{coinType}}',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transaction Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .status.pending { background: #fff3cd; color: #856404; }
            .status.confirmed { background: #d4edda; color: #155724; }
            .status.failed { background: #f8d7da; color: #721c24; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Transaction Confirmation</h1>
            </div>
            <div class="content">
              <h2>{{type}} Transaction</h2>
              <div class="status {{status}}">{{status}}</div>
              <p><strong>Amount:</strong> {{amount}} {{coinType}}</p>
              <p><strong>Transaction Hash:</strong> {{transactionHash}}</p>
              <p><strong>From:</strong> {{fromAddress}}</p>
              <p><strong>To:</strong> {{toAddress}}</p>
              <p><strong>Fee:</strong> {{fee}} {{coinType}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              {{#if estimatedTime}}
              <p><strong>Estimated Time:</strong> {{estimatedTime}}</p>
              {{/if}}
              <p>You can track this transaction on the blockchain using the provided hash.</p>
              <p>Best regards,<br>The CryptoVault Pro Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CryptoVault Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Transaction Confirmation

        Type: {{type}}
        Status: {{status}}
        Amount: {{amount}} {{coinType}}
        Transaction Hash: {{transactionHash}}
        From: {{fromAddress}}
        To: {{toAddress}}
        Fee: {{fee}} {{coinType}}
        Date: {{date}}
        {{#if estimatedTime}}
        Estimated Time: {{estimatedTime}}
        {{/if}}

        You can track this transaction on the blockchain using the provided hash.

        Best regards,
        The CryptoVault Pro Team
      `,
      variables: ['type', 'status', 'amount', 'coinType', 'transactionHash', 'fromAddress', 'toAddress', 'fee', 'date', 'estimatedTime']
    });

    // Security alert template
    this.templates.set('security', {
      id: 'security',
      name: 'Security Alert',
      subject: 'Security Alert - {{action}}',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Security Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Security Alert</h1>
            </div>
            <div class="content">
              <h2>{{action}}</h2>
              <div class="alert">
                <p>We detected a security action on your account:</p>
                <p><strong>Action:</strong> {{action}}</p>
                <p><strong>IP Address:</strong> {{ipAddress}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Device:</strong> {{userAgent}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
              </div>
              {{#if wasThisYou}}
              <div class="info">
                <p>If this was you, no action is needed. Your account security is working as intended.</p>
              </div>
              {{else}}
              <div class="alert">
                <p>If this was NOT you, please take immediate action:</p>
                <ul>
                  <li>Change your password immediately</li>
                  <li>Enable two-factor authentication</li>
                  <li>Review your recent account activity</li>
                  <li>Contact support if you need assistance</li>
                </ul>
              </div>
              {{/if}}
              <p>Best regards,<br>The CryptoVault Pro Security Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CryptoVault Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Security Alert - {{action}}

        We detected a security action on your account:
        Action: {{action}}
        IP Address: {{ipAddress}}
        Location: {{location}}
        Device: {{userAgent}}
        Time: {{timestamp}}

        {{#if wasThisYou}}
        If this was you, no action is needed. Your account security is working as intended.
        {{else}}
        If this was NOT you, please take immediate action:
        - Change your password immediately
        - Enable two-factor authentication
        - Review your recent account activity
        - Contact support if you need assistance
        {{/if}}

        Best regards,
        The CryptoVault Pro Security Team
      `,
      variables: ['action', 'ipAddress', 'location', 'userAgent', 'timestamp', 'wasThisYou']
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let htmlContent = options.html;
      let textContent = options.text;

      // Use template if specified
      if (options.template && options.templateData) {
        const template = this.templates.get(options.template);
        if (template) {
          htmlContent = this.processTemplate(template.htmlTemplate, options.templateData);
          textContent = this.processTemplate(template.textTemplate, options.templateData);
        }
      }

      const mailOptions = {
        from: process.env['SMTP_FROM'] || 'noreply@cryptovaultpro.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: htmlContent,
        text: textContent
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw createError('Failed to send email', 500);
    }
  }

  async sendWelcomeEmail(email: string, fullName: string, verificationLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      template: 'welcome',
      templateData: {
        fullName,
        verificationLink
      }
    });
  }

  async sendTransactionConfirmation(
    email: string,
    transactionData: {
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
    }
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      template: 'transaction',
      templateData: transactionData
    });
  }

  async sendSecurityAlert(
    email: string,
    securityData: {
      action: string;
      ipAddress: string;
      location: string;
      userAgent: string;
      timestamp: string;
      wasThisYou?: boolean;
    }
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      template: 'security',
      templateData: securityData
    });
  }

  async sendCustomEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent
    });
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    // Process in batches to avoid overwhelming the email server
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const email of batch) {
        try {
          await this.sendEmail({
            to: email,
            subject,
            html: htmlContent,
            text: textContent
          });
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push(`${email}: ${error}`);
        }
      }

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  async verifyEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    // Handle conditional blocks (simple implementation)
    processed = processed.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      const value = data[condition];
      return value ? content : '';
    });

    return processed;
  }

  getAvailableTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }
}

export default new EmailService();
