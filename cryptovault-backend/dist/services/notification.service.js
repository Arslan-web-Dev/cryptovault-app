"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const email_service_1 = __importDefault(require("./email.service"));
class NotificationService {
    async createNotification(notificationData) {
        const { userId, type, title, message, data, channels = ['IN_APP'], priority = 'MEDIUM' } = notificationData;
        // Get user notification preferences
        const preferences = await this.getUserNotificationPreferences(userId);
        // Create in-app notification
        if (channels.includes('IN_APP') && preferences.inAppNotifications) {
            await database_1.prisma.notification.create({
                data: {
                    user_id: userId,
                    type: type,
                    title: title,
                    message: message,
                    data: data || {},
                    priority: priority,
                    is_read: false,
                    created_at: new Date()
                }
            });
        }
        // Send email notification
        if (channels.includes('EMAIL') && preferences.emailNotifications) {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, full_name: true }
            });
            if (user) {
                try {
                    await this.sendEmailNotification(user.email, user.full_name, type, title, message, data);
                }
                catch (error) {
                    console.error('Failed to send email notification:', error);
                }
            }
        }
        // Send push notification (placeholder for future implementation)
        if (channels.includes('PUSH') && preferences.pushNotifications) {
            await this.sendPushNotification(userId, title, message, type, data);
        }
    }
    async getUserNotifications(userId, page = 1, limit = 20, filters = {}) {
        const skip = (page - 1) * limit;
        const whereClause = { user_id: userId };
        if (filters.type) {
            whereClause.type = filters.type;
        }
        if (filters.isRead !== undefined) {
            whereClause.is_read = filters.isRead;
        }
        if (filters.priority) {
            whereClause.priority = filters.priority;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            database_1.prisma.notification.findMany({
                where: whereClause,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            database_1.prisma.notification.count({ where: whereClause }),
            database_1.prisma.notification.count({
                where: { user_id: userId, is_read: false }
            })
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            unreadCount
        };
    }
    async markNotificationAsRead(userId, notificationId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: {
                id: notificationId,
                user_id: userId
            }
        });
        if (!notification) {
            throw (0, error_middleware_1.createError)('Notification not found', 404);
        }
        await database_1.prisma.notification.update({
            where: { id: notificationId },
            data: {
                is_read: true,
                read_at: new Date()
            }
        });
    }
    async markAllNotificationsAsRead(userId) {
        await database_1.prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: {
                is_read: true,
                read_at: new Date()
            }
        });
    }
    async deleteNotification(userId, notificationId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: {
                id: notificationId,
                user_id: userId
            }
        });
        if (!notification) {
            throw (0, error_middleware_1.createError)('Notification not found', 404);
        }
        await database_1.prisma.notification.delete({
            where: { id: notificationId }
        });
    }
    async getUserNotificationPreferences(userId) {
        let preferences = await database_1.prisma.notificationPreference.findUnique({
            where: { user_id: userId }
        });
        if (!preferences) {
            // Create default preferences
            preferences = await database_1.prisma.notificationPreference.create({
                data: {
                    user_id: userId,
                    email_notifications: true,
                    push_notifications: true,
                    in_app_notifications: true,
                    transaction_alerts: true,
                    security_alerts: true,
                    marketing_emails: false,
                    price_alerts: true,
                    staking_alerts: true,
                    referral_alerts: true
                }
            });
        }
        return {
            userId: preferences.user_id,
            emailNotifications: preferences.email_notifications,
            pushNotifications: preferences.push_notifications,
            inAppNotifications: preferences.in_app_notifications,
            transactionAlerts: preferences.transaction_alerts,
            securityAlerts: preferences.security_alerts,
            marketingEmails: preferences.marketing_emails,
            priceAlerts: preferences.price_alerts,
            stakingAlerts: preferences.staking_alerts,
            referralAlerts: preferences.referral_alerts
        };
    }
    async updateNotificationPreferences(userId, preferences) {
        const updated = await database_1.prisma.notificationPreference.upsert({
            where: { user_id: userId },
            update: {
                email_notifications: preferences.emailNotifications,
                push_notifications: preferences.pushNotifications,
                in_app_notifications: preferences.inAppNotifications,
                transaction_alerts: preferences.transactionAlerts,
                security_alerts: preferences.security_alerts,
                marketing_emails: preferences.marketingEmails,
                price_alerts: preferences.priceAlerts,
                staking_alerts: preferences.stakingAlerts,
                referral_alerts: preferences.referralAlerts,
                updated_at: new Date()
            },
            create: {
                user_id: userId,
                email_notifications: preferences.emailNotifications ?? true,
                push_notifications: preferences.pushNotifications ?? true,
                in_app_notifications: preferences.inAppNotifications ?? true,
                transaction_alerts: preferences.transactionAlerts ?? true,
                security_alerts: preferences.securityAlerts ?? true,
                marketing_emails: preferences.marketingEmails ?? false,
                price_alerts: preferences.priceAlerts ?? true,
                staking_alerts: preferences.stakingAlerts ?? true,
                referral_alerts: preferences.referralAlerts ?? true
            }
        });
        return {
            userId: updated.user_id,
            emailNotifications: updated.email_notifications,
            pushNotifications: updated.push_notifications,
            inAppNotifications: updated.in_app_notifications,
            transactionAlerts: updated.transaction_alerts,
            securityAlerts: updated.security_alerts,
            marketingEmails: updated.marketing_emails,
            priceAlerts: updated.price_alerts,
            stakingAlerts: updated.staking_alerts,
            referralAlerts: updated.referral_alerts
        };
    }
    // Specific notification methods
    async sendTransactionNotification(userId, transactionData) {
        const preferences = await this.getUserNotificationPreferences(userId);
        if (!preferences.transactionAlerts) {
            return;
        }
        const title = `${transactionData.type} Transaction ${transactionData.status}`;
        const message = `${transactionData.amount} ${transactionData.coinType} - Hash: ${transactionData.transactionHash}`;
        await this.createNotification({
            userId,
            type: transactionData.status === 'confirmed' ? 'SUCCESS' : 'INFO',
            title,
            message,
            data: transactionData,
            channels: ['IN_APP', 'EMAIL'],
            priority: 'MEDIUM'
        });
    }
    async sendSecurityNotification(userId, securityData) {
        const preferences = await this.getUserNotificationPreferences(userId);
        if (!preferences.securityAlerts) {
            return;
        }
        const title = `Security Alert: ${securityData.action}`;
        const message = `Activity detected from ${securityData.ipAddress} (${securityData.location})`;
        await this.createNotification({
            userId,
            type: 'SECURITY',
            title,
            message,
            data: securityData,
            channels: ['IN_APP', 'EMAIL', 'PUSH'],
            priority: 'HIGH'
        });
        // Also send immediate security email
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, full_name: true }
        });
        if (user) {
            await email_service_1.default.sendSecurityAlert(user.email, {
                ...securityData,
                wasThisYou: false // Default to false for security
            });
        }
    }
    async sendStakingNotification(userId, stakingData) {
        const preferences = await this.getUserNotificationPreferences(userId);
        if (!preferences.stakingAlerts) {
            return;
        }
        const title = `Staking ${stakingData.action}`;
        let message = `${stakingData.amount} ${stakingData.coinType}`;
        if (stakingData.rewards) {
            message += ` - Rewards: ${stakingData.rewards}`;
        }
        await this.createNotification({
            userId,
            type: 'SUCCESS',
            title,
            message,
            data: stakingData,
            channels: ['IN_APP', 'EMAIL'],
            priority: 'MEDIUM'
        });
    }
    async sendReferralNotification(userId, referralData) {
        const preferences = await this.getUserNotificationPreferences(userId);
        if (!preferences.referralAlerts) {
            return;
        }
        const title = `Referral ${referralData.action}`;
        let message = '';
        switch (referralData.action) {
            case 'REFERRED':
                message = `New user signed up with your code`;
                break;
            case 'COMPLETED':
                message = `Referral completed - ${referralData.referredUser}`;
                break;
            case 'REWARD_EARNED':
                message = `Referral reward earned: ${referralData.amount}`;
                break;
        }
        await this.createNotification({
            userId,
            type: 'SUCCESS',
            title,
            message,
            data: referralData,
            channels: ['IN_APP', 'EMAIL'],
            priority: 'MEDIUM'
        });
    }
    async sendPriceAlert(userId, priceData) {
        const preferences = await this.getUserNotificationPreferences(userId);
        if (!preferences.priceAlerts) {
            return;
        }
        const title = `Price Alert: ${priceData.coinType}`;
        const message = `${priceData.coinType} is ${priceData.alertType.toLowerCase()} $${priceData.targetPrice} (Current: $${priceData.currentPrice})`;
        await this.createNotification({
            userId,
            type: 'INFO',
            title,
            message,
            data: priceData,
            channels: ['IN_APP', 'EMAIL'],
            priority: 'LOW'
        });
    }
    async cleanupOldNotifications() {
        // Delete notifications older than 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        await database_1.prisma.notification.deleteMany({
            where: {
                created_at: {
                    lt: ninetyDaysAgo
                },
                is_read: true
            }
        });
    }
    async sendEmailNotification(email, fullName, type, title, message, data) {
        // Create a simple email template for notifications
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2>Hi ${fullName},</h2>
            <p>${message}</p>
            ${data ? `<p>Additional details: ${JSON.stringify(data, null, 2)}</p>` : ''}
            <p>Best regards,<br>The CryptoVault Pro Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 CryptoVault Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await email_service_1.default.sendCustomEmail(email, title, htmlContent, message);
    }
    async sendPushNotification(userId, title, message, type, data) {
        // Placeholder for push notification implementation
        // In a real implementation, this would integrate with Firebase Cloud Messaging or similar service
        console.log(`Push notification for user ${userId}: ${title} - ${message}`);
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=notification.service.js.map