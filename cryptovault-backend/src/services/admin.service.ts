import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';
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
  kycLevel: 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
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

class AdminService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalWallets,
      pendingKyc
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          is_active: true,
          last_login_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.transaction.count(),
      prisma.wallet.count(),
      prisma.user.count({
        where: {
          kyc_level: 'NONE'
        }
      })
    ]);

    // Calculate total volume (simplified)
    const volumeResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      }
    });

    // Calculate total staked
    const stakingResult = await prisma.stakingPosition.aggregate({
      where: {
        status: 'active'
      },
      _sum: {
        amount: true
      }
    });

    // Determine system health
    const systemHealth = await this.calculateSystemHealth();

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume: volumeResult._sum.amount || 0,
      totalWallets,
      totalStaked: stakingResult._sum.amount || 0,
      pendingKyc,
      systemHealth
    };
  }

  async getUsers(
    page: number = 1,
    limit: number = 20,
    filters: {
      search?: string;
      role?: UserRole;
      kycLevel?: string;
      status?: 'active' | 'inactive';
      sortBy?: 'createdAt' | 'lastLogin' | 'balance' | 'transactions';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    users: UserManagementData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    // Apply filters
    if (filters.search) {
      whereClause.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { full_name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.role) {
      whereClause.role = filters.role;
    }

    if (filters.kycLevel) {
      whereClause.kyc_level = filters.kycLevel;
    }

    if (filters.status) {
      whereClause.is_active = filters.status === 'active';
    }

    // Determine sort order
    const orderBy: any = {};
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder || 'desc';

    switch (sortField) {
      case 'createdAt':
        orderBy.created_at = sortDirection;
        break;
      case 'lastLogin':
        orderBy.last_login_at = sortDirection;
        break;
      case 'balance':
        // Will be calculated separately
        break;
      case 'transactions':
        // Will be calculated separately
        break;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          country: true,
          role: true,
          kyc_level: true,
          is_active: true,
          is_email_verified: true,
          two_factor_enabled: true,
          created_at: true,
          last_login_at: true
        },
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { created_at: sortDirection },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Enrich user data with additional information
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const [walletBalance, transactionCount, riskScore] = await Promise.all([
          this.getUserTotalBalance(user.id),
          this.getUserTransactionCount(user.id),
          this.calculateUserRiskScore(user.id)
        ]);

        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          country: user.country,
          role: user.role,
          kycLevel: user.kyc_level,
          isActive: user.is_active,
          isEmailVerified: user.is_email_verified,
          twoFactorEnabled: user.two_factor_enabled,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at || undefined,
          totalBalance: walletBalance,
          transactionCount,
          riskScore
        };
      })
    );

    // Sort by balance or transactions if requested
    if (filters.sortBy === 'balance') {
      enrichedUsers.sort((a, b) => 
        sortDirection === 'desc' ? b.totalBalance - a.totalBalance : a.totalBalance - b.totalBalance
      );
    } else if (filters.sortBy === 'transactions') {
      enrichedUsers.sort((a, b) => 
        sortDirection === 'desc' ? b.transactionCount - a.transactionCount : a.transactionCount - b.transactionCount
      );
    }

    return {
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserDetails(userId: string): Promise<UserManagementData & {
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
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const [walletBalance, transactionCount, riskScore, wallets, recentTransactions, kycDocuments, loginHistory] = await Promise.all([
      this.getUserTotalBalance(userId),
      this.getUserTransactionCount(userId),
      this.calculateUserRiskScore(userId),
      prisma.wallet.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          coin_type: true,
          wallet_address: true,
          balance: true,
          is_default: true
        }
      }),
      prisma.transaction.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: 10
      }),
      prisma.kycDocument.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          document_type: true,
          status: true,
          uploaded_at: true
        },
        orderBy: { uploaded_at: 'desc' }
      })
    ]);

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      country: user.country,
      role: user.role,
      kycLevel: user.kyc_level,
      isActive: user.status === 'ACTIVE',
      isEmailVerified: user.is_email_verified,
      twoFactorEnabled: user.is_2fa_enabled,
      createdAt: user.created_at,
      lastLoginAt: user.last_login || undefined,
      totalBalance: walletBalance,
      transactionCount,
      riskScore,
      wallets: wallets.map(w => ({
        id: w.id,
        coinType: w.coin_type,
        address: w.wallet_address,
        balance: w.balance,
        isDefault: w.is_default
      })),
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        createdAt: t.created_at
      })),
      kycDocuments: kycDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.document_type,
        status: doc.status,
        uploadedAt: doc.uploaded_at
      })),
      loginHistory: loginHistory.map(login => ({
        id: login.id,
        ipAddress: login.ip_address,
        userAgent: login.user_agent,
        createdAt: login.created_at
      }))
    };
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role, updated_at: new Date() }
    });
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        is_active: isActive,
        updated_at: new Date()
      }
    });

    // Log the action (console only for now)
    console.log(`User ${isActive ? 'activated' : 'deactivated'}: ${userId}, reason: ${reason}`);
  }

  async updateUserKycLevel(userId: string, kycLevel: 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        kyc_level: kycLevel as any,
        updated_at: new Date()
      }
    });
  }

  async forcePasswordReset(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Invalidate all user sessions
    await prisma.session.deleteMany({
      where: { user_id: userId }
    });

    // Set password reset flag
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password_reset_required: true,
        updated_at: new Date()
      }
    });
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    // Generate system alerts based on various conditions
    const alerts: SystemAlert[] = [];

    // Check for high-risk users
    const highRiskUsers = await this.getHighRiskUsers();
    if (highRiskUsers.length > 0) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'security',
        severity: 'high',
        title: 'High Risk Users Detected',
        message: `${highRiskUsers.length} users have elevated risk scores requiring review`,
        createdAt: new Date(),
        resolved: false
      });
    }

    // Check for failed login attempts
    const failedLogins = await this.getRecentFailedLogins();
    if (failedLogins > 100) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'security',
        severity: 'medium',
        title: 'Suspicious Login Activity',
        message: `${failedLogins} failed login attempts in the last hour`,
        createdAt: new Date(),
        resolved: false
      });
    }

    // Check for pending KYC
    const pendingKyc = await prisma.user.count({
      where: { kyc_level: 'LEVEL_0' as any }
    });
    if (pendingKyc > 50) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        type: 'compliance',
        severity: 'medium',
        title: 'KYC Backlog',
        message: `${pendingKyc} users awaiting KYC verification`,
        createdAt: new Date(),
        resolved: false
      });
    }

    // Check system performance
    const systemHealth = await this.calculateSystemHealth();
    if (systemHealth === 'critical') {
      alerts.push({
        id: `alert-${Date.now()}-4`,
        type: 'performance',
        severity: 'critical',
        title: 'System Performance Critical',
        message: 'System performance metrics indicate critical issues',
        createdAt: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  async resolveAlert(alertId: string, adminId: string): Promise<void> {
    // This would typically update the alert in the database
    // For now, we'll just log the action
    // Admin logging not implemented - log to console instead
    const action = 'ALERT_RESOLVED';
    const targetUserId = alertId;
    console.log(`Admin action: ${action} by ${adminId} on ${targetUserId}`);
  }

  async getTransactionMonitoring(
    page: number = 1,
    limit: number = 50,
    filters: {
      status?: string;
      amountMin?: number;
      amountMax?: number;
      riskScoreMin?: number;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<{
    transactions: any[];
    pagination: any;
    statistics: {
      totalVolume: number;
      avgRiskScore: number;
      flaggedTransactions: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.amountMin || filters.amountMax) {
      whereClause.amount = {};
      if (filters.amountMin) whereClause.amount.gte = filters.amountMin;
      if (filters.amountMax) whereClause.amount.lte = filters.amountMax;
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.created_at = {};
      if (filters.dateFrom) whereClause.created_at.gte = filters.dateFrom;
      if (filters.dateTo) whereClause.created_at.lte = filters.dateTo;
    }

    const [transactions, total, volumeResult] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
              full_name: true
            }
          },
          wallet: {
            select: {
              coin_type: true,
              wallet_address: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.aggregate({
        where: whereClause,
        _sum: { amount: true },
        _avg: { risk_score: true }
      })
    ]);

    // Calculate flagged transactions
    const flaggedTransactions = transactions.filter(t => (t.risk_score || 0) > 70).length;

    return {
      transactions: transactions.map(t => ({
        ...t,
        riskScore: t.risk_score || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalVolume: parseFloat(volumeResult._sum.amount?.toString() || '0'),
        avgRiskScore: volumeResult._avg.risk_score || 0,
        flaggedTransactions
      }
    };
  }

  private async getUserTotalBalance(userId: string): Promise<number> {
    const result = await prisma.wallet.aggregate({
      where: { 
        user_id: userId,
        is_active: true
      },
      _sum: { balance: true }
    });
    return parseFloat(result._sum.balance?.toString() || '0');
  }

  private async getUserTransactionCount(userId: string): Promise<number> {
    return await prisma.transaction.count({
      where: { user_id: userId }
    });
  }

  private async calculateUserRiskScore(userId: string): Promise<number> {
    // Simplified risk calculation
    let riskScore = 0;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return 0;

    // Account age factor
    const accountAge = Date.now() - user.created_at.getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) riskScore += 20;
    else if (daysSinceCreation < 30) riskScore += 10;

    // KYC level factor
    if (user.kyc_level === 'LEVEL_0') riskScore += 30;
    else if (user.kyc_level === 'LEVEL_1') riskScore += 15;

    // Transaction pattern analysis
    const recentTransactions = await prisma.transaction.count({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    if (recentTransactions > 10) riskScore += 25;
    else if (recentTransactions > 5) riskScore += 10;

    return Math.min(riskScore, 100);
  }

  private async calculateSystemHealth(): Promise<'healthy' | 'warning' | 'critical'> {
    // Simplified health calculation
    const [activeUsers, recentErrors] = await Promise.all([
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          last_login: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      })
    ]);

    if (recentErrors > 100) return 'critical';
    if (recentErrors > 10 || activeUsers < 10) return 'warning';
    return 'healthy';
  }

  private async getHighRiskUsers(): Promise<string[]> {
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const highRiskUsers: string[] = [];
    for (const user of users) {
      const riskScore = await this.calculateUserRiskScore(user.id);
      if (riskScore > 70) {
        highRiskUsers.push(user.id);
      }
    }

    return highRiskUsers;
  }

  private async getRecentFailedLogins(): Promise<number> {
    // This would typically query a failed login attempts table
    // For now, return a placeholder
    return 0;
  }
}

export default new AdminService();
