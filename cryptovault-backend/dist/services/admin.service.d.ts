import { CoinType, UserRole } from '@prisma/client';
export interface AdminDashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalVolume: number;
    totalWallets: number;
    totalStaked: number;
    pendingKyc: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
}
export interface UserManagementData {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    country?: string;
    role: UserRole;
    kycLevel: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
    isActive: boolean;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
    totalBalance: number;
    transactionCount: number;
    riskScore: number;
}
export interface SystemAlert {
    id: string;
    type: 'security' | 'performance' | 'compliance' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    createdAt: Date;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
declare class AdminService {
    getDashboardStats(): Promise<AdminDashboardStats>;
    getUsers(page?: number, limit?: number, filters?: {
        search?: string;
        role?: UserRole;
        kycLevel?: string;
        status?: 'active' | 'inactive';
        sortBy?: 'createdAt' | 'lastLogin' | 'balance' | 'transactions';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        users: UserManagementData[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserDetails(userId: string): Promise<UserManagementData & {
        wallets: Array<{
            id: string;
            coinType: CoinType;
            address: string;
            balance: number;
            isDefault: boolean;
        }>;
        recentTransactions: Array<{
            id: string;
            type: string;
            amount: number;
            status: string;
            createdAt: Date;
        }>;
        kycDocuments: Array<{
            id: string;
            documentType: string;
            status: string;
            uploadedAt: Date;
        }>;
        loginHistory: Array<{
            id: string;
            ipAddress: string;
            userAgent: string;
            createdAt: Date;
        }>;
    }>;
    updateUserRole(userId: string, role: UserRole): Promise<void>;
    updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<void>;
    updateUserKycLevel(userId: string, kycLevel: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'): Promise<void>;
    forcePasswordReset(userId: string): Promise<void>;
    getSystemAlerts(): Promise<SystemAlert[]>;
    resolveAlert(alertId: string, adminId: string): Promise<void>;
    getTransactionMonitoring(page?: number, limit?: number, filters?: {
        status?: string;
        amountMin?: number;
        amountMax?: number;
        riskScoreMin?: number;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
        transactions: any[];
        pagination: any;
        summary: {
            totalVolume: number;
            avgRiskScore: number;
            flaggedTransactions: number;
        };
    }>;
    private getUserTotalBalance;
    private getUserTransactionCount;
    private calculateUserRiskScore;
    private calculateSystemHealth;
    private getHighRiskUsers;
    private getRecentFailedLogins;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=admin.service.d.ts.map