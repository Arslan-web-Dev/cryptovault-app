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
declare class NotificationService {
    createNotification(notificationData: NotificationData): Promise<void>;
    getUserNotifications(userId: string, page?: number, limit?: number, filters?: {
        type?: string;
        isRead?: boolean;
        priority?: string;
    }): Promise<{
        notifications: any[];
        pagination: any;
        unreadCount: number;
    }>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    getUserNotificationPreferences(userId: string): Promise<NotificationPreference>;
    updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference>;
    sendTransactionNotification(userId: string, transactionData: {
        type: string;
        status: string;
        amount: string;
        coinType: string;
        transactionHash: string;
    }): Promise<void>;
    sendSecurityNotification(userId: string, securityData: {
        action: string;
        ipAddress: string;
        location: string;
        userAgent: string;
        timestamp: string;
    }): Promise<void>;
    sendStakingNotification(userId: string, stakingData: {
        action: 'CREATED' | 'COMPLETED' | 'WITHDRAWN' | 'REWARD_EARNED';
        amount: string;
        coinType: string;
        rewards?: string;
    }): Promise<void>;
    sendReferralNotification(userId: string, referralData: {
        action: 'REFERRED' | 'COMPLETED' | 'REWARD_EARNED';
        referralCode?: string;
        amount?: string;
        referredUser?: string;
    }): Promise<void>;
    sendPriceAlert(userId: string, priceData: {
        coinType: string;
        currentPrice: number;
        targetPrice: number;
        alertType: 'ABOVE' | 'BELOW';
        change24h: number;
    }): Promise<void>;
    cleanupOldNotifications(): Promise<void>;
    private sendEmailNotification;
    private sendPushNotification;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map