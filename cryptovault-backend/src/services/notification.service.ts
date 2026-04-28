import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';
import emailService from './email.service';

export interface NotificationData {
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ('IN_APP' | 'EMAIL' | 'PUSH')[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface NotificationPreference {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  priceAlerts: boolean;
  stakingAlerts: boolean;
  referralAlerts: boolean;
}

class NotificationService {
  async createNotification(notificationData: NotificationData): Promise<void> {
    const {
      userId,
      type,
      title,
      message,
      data,
      channels = ['IN_APP'],
      priority = 'MEDIUM'
    } = notificationData;

    // Get user notification preferences
    const preferences = await this.getUserNotificationPreferences(userId);

    // Create in-app notification
    if (channels.includes('IN_APP') && preferences.inAppNotifications) {
      await prisma.notification.create({
        data: {
          user_id: userId,
          type: type as any,
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, full_name: true }
      });

      if (user) {
        try {
          await this.sendEmailNotification(user.email, user.full_name, type, title, message, data);
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      }
    }

    // Send push notification (placeholder for future implementation)
    if (channels.includes('PUSH') && preferences.pushNotifications) {
      await this.sendPushNotification(userId, title, message, type, data);
    }
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
      type?: string;
      isRead?: boolean;
      priority?: string;
    } = {}
  ): Promise<{
    notifications: any[];
    pagination: any;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;
    const whereClause: any = { user_id: userId };

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
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
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

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
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

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await prisma.notification_preferences.findUnique({
      where: { user_id: userId }
    });

    if (!preferences) {
      preferences = await prisma.notification_preferences.create({
        data: {
          user_id: userId,
          inAppNotifications: true,
          emailNotifications: false,
          pushNotifications: false,
          securityAlerts: true,
          transactionAlerts: true,
          stakingAlerts: true,
          referralAlerts: true,
          priceAlerts: true
        }
      });
    }

    return preferences as NotificationPreference;
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const updated = await prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: {
        email_notifications: preferences.emailNotifications,
        push_notifications: preferences.pushNotifications,
        in_app_notifications: preferences.inAppNotifications,
        transaction_alerts: preferences.transactionAlerts,
        security_alerts: preferences.securityAlerts,
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
  async sendTransactionNotification(
    userId: string,
    transactionData: {
      type: string;
      status: string;
      amount: string;
      coinType: string;
      transactionHash: string;
    }
  ): Promise<void> {
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

  async sendSecurityNotification(
    userId: string,
    securityData: {
      action: string;
      ipAddress: string;
      location: string;
      userAgent: string;
      timestamp: string;
    }
  ): Promise<void> {
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, full_name: true }
    });

    if (user) {
      await emailService.sendSecurityAlert(user.email, {
        ...securityData,
        wasThisYou: false // Default to false for security
      });
    }
  }

  async sendStakingNotification(
    userId: string,
    stakingData: {
      action: 'CREATED' | 'COMPLETED' | 'WITHDRAWN' | 'REWARD_EARNED';
      amount: string;
      coinType: string;
      rewards?: string;
    }
  ): Promise<void> {
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

  async sendReferralNotification(
    userId: string,
    referralData: {
      action: 'REFERRED' | 'COMPLETED' | 'REWARD_EARNED';
      referralCode?: string;
      amount?: string;
      referredUser?: string;
    }
  ): Promise<void> {
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

  async sendPriceAlert(
    userId: string,
    priceData: {
      coinType: string;
      currentPrice: number;
      targetPrice: number;
      alertType: 'ABOVE' | 'BELOW';
      change24h: number;
    }
  ): Promise<void> {
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

  async cleanupOldNotifications(): Promise<void> {
    // Delete notifications older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    await prisma.notification.deleteMany({
      where: {
        created_at: {
          lt: ninetyDaysAgo
        },
        is_read: true
      }
    });
  }

  private async sendEmailNotification(
    email: string,
    fullName: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
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

    await emailService.sendCustomEmail(email, title, htmlContent, message);
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: Record<string, any>
  ): Promise<void> {
    // Placeholder for push notification implementation
    // In a real implementation, this would integrate with Firebase Cloud Messaging or similar service
    console.log(`Push notification for user ${userId}: ${title} - ${message}`);
  }
}

export default new NotificationService();
