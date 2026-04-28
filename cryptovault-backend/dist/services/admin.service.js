"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminService {
    async getDashboardStats() {
        const [totalUsers, activeUsers, totalTransactions, totalWallets, pendingKyc] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.user.count({
                where: {
                    is_active: true,
                    last_login_at: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            database_1.prisma.transaction.count(),
            database_1.prisma.wallet.count(),
            database_1.prisma.user.count({
                where: {
                    kyc_level: 'NONE'
                }
            })
        ]);
        // Calculate total volume (simplified)
        const volumeResult = await database_1.prisma.transaction.aggregate({
            _sum: {
                amount: true
            }
        });
        // Calculate total staked
        const stakingResult = await database_1.prisma.stakingPosition.aggregate({
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
    async getUsers(page = 1, limit = 20, filters = {}) {
        const skip = (page - 1) * limit;
        const whereClause = {};
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
        const orderBy = {};
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
            database_1.prisma.user.findMany({
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
            database_1.prisma.user.count({ where: whereClause })
        ]);
        // Enrich user data with additional information
        const enrichedUsers = await Promise.all(users.map(async (user) => {
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
        }));
        // Sort by balance or transactions if requested
        if (filters.sortBy === 'balance') {
            enrichedUsers.sort((a, b) => sortDirection === 'desc' ? b.totalBalance - a.totalBalance : a.totalBalance - b.totalBalance);
        }
        else if (filters.sortBy === 'transactions') {
            enrichedUsers.sort((a, b) => sortDirection === 'desc' ? b.transactionCount - a.transactionCount : a.transactionCount - b.transactionCount);
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
    async getUserDetails(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('User not found', 404);
        }
        const [walletBalance, transactionCount, riskScore, wallets, recentTransactions, kycDocuments, loginHistory] = await Promise.all([
            this.getUserTotalBalance(userId),
            this.getUserTransactionCount(userId),
            this.calculateUserRiskScore(userId),
            database_1.prisma.wallet.findMany({
                where: { user_id: userId },
                select: {
                    id: true,
                    coin_type: true,
                    wallet_address: true,
                    balance: true,
                    is_default: true
                }
            }),
            database_1.prisma.transaction.findMany({
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
            database_1.prisma.kycDocument.findMany({
                where: { user_id: userId },
                select: {
                    id: true,
                    document_type: true,
                    status: true,
                    uploaded_at: true
                },
                orderBy: { uploaded_at: 'desc' }
            }),
            database_1.prisma.loginHistory.findMany({
                where: { user_id: userId },
                select: {
                    id: true,
                    ip_address: true,
                    user_agent: true,
                    created_at: true
                },
                orderBy: { created_at: 'desc' },
                take: 10
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
            isActive: user.is_active,
            isEmailVerified: user.is_email_verified,
            twoFactorEnabled: user.two_factor_enabled,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at || undefined,
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
    async updateUserRole(userId, role) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('User not found', 404);
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { role, updated_at: new Date() }
        });
    }
    async updateUserStatus(userId, isActive, reason) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('User not found', 404);
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                is_active: isActive,
                updated_at: new Date()
            }
        });
        // Log the action
        await database_1.prisma.adminLog.create({
            data: {
                admin_id: 'system', // Would be actual admin ID
                action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
                target_user_id: userId,
                details: reason || `User ${isActive ? 'activated' : 'deactivated'} by admin`,
                created_at: new Date()
            }
        });
    }
    async updateUserKycLevel(userId, kycLevel) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('User not found', 404);
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                kyc_level: kycLevel,
                updated_at: new Date()
            }
        });
    }
    async forcePasswordReset(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('User not found', 404);
        }
        // Invalidate all user sessions
        await database_1.prisma.session.deleteMany({
            where: { user_id: userId }
        });
        // Set password reset flag
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                password_reset_required: true,
                updated_at: new Date()
            }
        });
    }
    async getSystemAlerts() {
        // Generate system alerts based on various conditions
        const alerts = [];
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
        const pendingKyc = await database_1.prisma.user.count({
            where: { kyc_level: 'NONE' }
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
    async resolveAlert(alertId, adminId) {
        // This would typically update the alert in the database
        // For now, we'll just log the action
        await database_1.prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: 'ALERT_RESOLVED',
                details: `Alert ${alertId} resolved`,
                created_at: new Date()
            }
        });
    }
    async getTransactionMonitoring(page = 1, limit = 50, filters = {}) {
        const skip = (page - 1) * limit;
        const whereClause = {};
        // Apply filters
        if (filters.status) {
            whereClause.status = filters.status;
        }
        if (filters.amountMin || filters.amountMax) {
            whereClause.amount = {};
            if (filters.amountMin)
                whereClause.amount.gte = filters.amountMin;
            if (filters.amountMax)
                whereClause.amount.lte = filters.amountMax;
        }
        if (filters.dateFrom || filters.dateTo) {
            whereClause.created_at = {};
            if (filters.dateFrom)
                whereClause.created_at.gte = filters.dateFrom;
            if (filters.dateTo)
                whereClause.created_at.lte = filters.dateTo;
        }
        const [transactions, total, volumeResult] = await Promise.all([
            database_1.prisma.transaction.findMany({
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
            database_1.prisma.transaction.count({ where: whereClause }),
            database_1.prisma.transaction.aggregate({
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
                totalVolume: volumeResult._sum.amount || 0,
                avgRiskScore: volumeResult._avg.risk_score || 0,
                flaggedTransactions
            }
        };
    }
    async getUserTotalBalance(userId) {
        const result = await database_1.prisma.wallet.aggregate({
            where: {
                user_id: userId,
                is_active: true
            },
            _sum: { balance: true }
        });
        return result._sum.balance || 0;
    }
    async getUserTransactionCount(userId) {
        return await database_1.prisma.transaction.count({
            where: { user_id: userId }
        });
    }
    async calculateUserRiskScore(userId) {
        // Simplified risk calculation
        let riskScore = 0;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user)
            return 0;
        // Account age factor
        const accountAge = Date.now() - user.created_at.getTime();
        const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 7)
            riskScore += 20;
        else if (daysSinceCreation < 30)
            riskScore += 10;
        // KYC level factor
        if (user.kyc_level === 'NONE')
            riskScore += 30;
        else if (user.kyc_level === 'LEVEL_1')
            riskScore += 15;
        // Transaction pattern analysis
        const recentTransactions = await database_1.prisma.transaction.count({
            where: {
                user_id: userId,
                created_at: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });
        if (recentTransactions > 10)
            riskScore += 25;
        else if (recentTransactions > 5)
            riskScore += 10;
        return Math.min(riskScore, 100);
    }
    async calculateSystemHealth() {
        // Simplified health calculation
        const [activeUsers, recentErrors] = await Promise.all([
            database_1.prisma.user.count({
                where: {
                    is_active: true,
                    last_login_at: {
                        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                    }
                }
            }),
            database_1.prisma.errorLog.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                    }
                }
            })
        ]);
        if (recentErrors > 100)
            return 'critical';
        if (recentErrors > 10 || activeUsers < 10)
            return 'warning';
        return 'healthy';
    }
    async getHighRiskUsers() {
        const users = await database_1.prisma.user.findMany({
            select: { id: true }
        });
        const highRiskUsers = [];
        for (const user of users) {
            const riskScore = await this.calculateUserRiskScore(user.id);
            if (riskScore > 70) {
                highRiskUsers.push(user.id);
            }
        }
        return highRiskUsers;
    }
    async getRecentFailedLogins() {
        // This would typically query a failed login attempts table
        // For now, return a placeholder
        return 0;
    }
}
exports.default = new AdminService();
//# sourceMappingURL=admin.service.js.map