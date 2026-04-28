"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const uuid_1 = require("uuid");
class ReferralService {
    constructor() {
        this.REFERRAL_BONUSES = {
            signup: 10, // $10 for successful referral signup
            trade: 0.001, // 0.1% of trading volume
            staking: 0.05, // 5% of staking rewards
            deposit: 0.01 // 1% of first deposit (up to $100)
        };
    }
    async createReferralCode(userId) {
        // Check if user already has a referral code
        const existingCode = await database_1.prisma.referralCode.findFirst({
            where: { user_id: userId }
        });
        if (existingCode) {
            return {
                id: existingCode.id,
                userId: existingCode.user_id,
                code: existingCode.code,
                isActive: existingCode.is_active,
                totalReferrals: existingCode.total_referrals,
                totalRewards: existingCode.total_rewards,
                createdAt: existingCode.created_at
            };
        }
        // Generate unique referral code
        const code = await this.generateUniqueReferralCode();
        const referralCode = await database_1.prisma.referralCode.create({
            data: {
                user_id: userId,
                code: code,
                is_active: true,
                total_referrals: 0,
                total_rewards: 0
            }
        });
        return {
            id: referralCode.id,
            userId: referralCode.user_id,
            code: referralCode.code,
            isActive: referralCode.is_active,
            totalReferrals: referralCode.total_referrals,
            totalRewards: referralCode.total_rewards,
            createdAt: referralCode.created_at
        };
    }
    async getReferralCode(userId) {
        const referralCode = await database_1.prisma.referralCode.findFirst({
            where: { user_id: userId }
        });
        if (!referralCode) {
            return null;
        }
        return {
            id: referralCode.id,
            userId: referralCode.user_id,
            code: referralCode.code,
            isActive: referralCode.is_active,
            totalReferrals: referralCode.total_referrals,
            totalRewards: referralCode.total_rewards,
            createdAt: referralCode.created_at
        };
    }
    async validateReferralCode(code) {
        const referralCode = await database_1.prisma.referralCode.findFirst({
            where: {
                code: code.toUpperCase(),
                is_active: true
            }
        });
        if (!referralCode) {
            return { valid: false };
        }
        return { valid: true, referrerId: referralCode.user_id };
    }
    async applyReferralCode(userId, referralCode) {
        // Validate referral code
        const validation = await this.validateReferralCode(referralCode);
        if (!validation.valid) {
            throw (0, error_middleware_1.createError)('Invalid referral code', 400);
        }
        // Check if user was already referred
        const existingReferral = await database_1.prisma.referralRelationship.findFirst({
            where: { referred_id: userId }
        });
        if (existingReferral) {
            throw (0, error_middleware_1.createError)('User was already referred', 400);
        }
        // Cannot refer yourself
        if (validation.referrerId === userId) {
            throw (0, error_middleware_1.createError)('Cannot refer yourself', 400);
        }
        // Create referral relationship
        const referral = await database_1.prisma.referralRelationship.create({
            data: {
                referrer_id: validation.referrerId,
                referred_id: userId,
                referral_code: referralCode.toUpperCase(),
                status: 'pending',
                reward_amount: this.REFERRAL_BONUSES.signup,
                reward_type: 'fixed'
            }
        });
        // Update referral code stats
        await database_1.prisma.referralCode.update({
            where: { id: validation.referrerId },
            data: {
                total_referrals: { increment: 1 }
            }
        });
        return {
            id: referral.id,
            referrerId: referral.referrer_id,
            referredId: referral.referred_id,
            referralCode: referral.referral_code,
            status: referral.status,
            rewardAmount: referral.reward_amount,
            rewardType: referral.reward_type,
            completedAt: referral.completed_at || undefined,
            rewardedAt: referral.rewarded_at || undefined
        };
    }
    async completeReferral(referredId) {
        const referral = await database_1.prisma.referralRelationship.findFirst({
            where: {
                referred_id: referredId,
                status: 'pending'
            }
        });
        if (!referral) {
            return;
        }
        // Update referral status
        await database_1.prisma.referralRelationship.update({
            where: { id: referral.id },
            data: {
                status: 'completed',
                completed_at: new Date()
            }
        });
        // Create reward
        await this.createReferralReward(referral.id, referral.referrer_id, this.REFERRAL_BONUSES.signup, 'signup', 'Successful referral signup bonus');
        // Update referral code total rewards
        await database_1.prisma.referralCode.update({
            where: { user_id: referral.referrer_id },
            data: {
                total_rewards: { increment: this.REFERRAL_BONUSES.signup }
            }
        });
    }
    async createReferralReward(referralId, referrerId, amount, type, description) {
        const reward = await database_1.prisma.referralReward.create({
            data: {
                referral_id: referralId,
                referrer_id: referrerId,
                amount: amount,
                type: type,
                description: description,
                status: 'pending'
            }
        });
        return {
            id: reward.id,
            referralId: reward.referral_id,
            referrerId: reward.referrer_id,
            amount: reward.amount,
            type: reward.type,
            description: reward.description,
            status: reward.status,
            createdAt: reward.created_at,
            paidAt: reward.paid_at || undefined
        };
    }
    async getUserReferrals(userId) {
        const [referralCode, referrals, rewards] = await Promise.all([
            this.getReferralCode(userId),
            database_1.prisma.referralRelationship.findMany({
                where: { referrer_id: userId },
                include: {
                    referred: {
                        select: {
                            email: true,
                            full_name: true,
                            created_at: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            database_1.prisma.referralReward.findMany({
                where: { referrer_id: userId }
            })
        ]);
        const totalRewards = rewards
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + r.amount, 0);
        const pendingRewards = rewards
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.amount, 0);
        const formattedReferrals = referrals.map(referral => ({
            id: referral.id,
            referrerId: referral.referrer_id,
            referredId: referral.referred_id,
            referralCode: referral.referral_code,
            status: referral.status,
            rewardAmount: referral.reward_amount,
            rewardType: referral.reward_type,
            completedAt: referral.completed_at || undefined,
            rewardedAt: referral.rewarded_at || undefined
        }));
        return {
            referralCode,
            referrals: formattedReferrals,
            totalRewards,
            pendingRewards
        };
    }
    async trackTradeReferral(userId, tradeVolume) {
        // Check if user was referred
        const referral = await database_1.prisma.referralRelationship.findFirst({
            where: {
                referred_id: userId,
                status: 'completed'
            }
        });
        if (!referral) {
            return;
        }
        const rewardAmount = tradeVolume * this.REFERRAL_BONUSES.trade;
        // Create trade reward
        await this.createReferralReward(referral.id, referral.referrer_id, rewardAmount, 'trade', `Trade referral bonus: ${tradeVolume} volume`);
    }
    async trackStakingReferral(userId, stakingRewards) {
        // Check if user was referred
        const referral = await database_1.prisma.referralRelationship.findFirst({
            where: {
                referred_id: userId,
                status: 'completed'
            }
        });
        if (!referral) {
            return;
        }
        const rewardAmount = stakingRewards * this.REFERRAL_BONUSES.staking;
        // Create staking reward
        await this.createReferralReward(referral.id, referral.referrer_id, rewardAmount, 'staking', `Staking referral bonus: ${stakingRewards} rewards`);
    }
    async trackDepositReferral(userId, depositAmount) {
        // Check if user was referred and this is their first deposit
        const referral = await database_1.prisma.referralRelationship.findFirst({
            where: {
                referred_id: userId,
                status: 'completed'
            }
        });
        if (!referral) {
            return;
        }
        // Check if user has previous deposits (simplified)
        const hasPreviousDeposits = await database_1.prisma.transaction.findFirst({
            where: {
                user_id: userId,
                type: 'receive'
            }
        });
        if (hasPreviousDeposits) {
            return; // Not first deposit
        }
        const rewardAmount = Math.min(depositAmount * this.REFERRAL_BONUSES.deposit, 100);
        // Create deposit reward
        await this.createReferralReward(referral.id, referral.referrer_id, rewardAmount, 'deposit', `First deposit referral bonus: ${depositAmount} deposit`);
    }
    async payReferralRewards(referrerId) {
        const pendingRewards = await database_1.prisma.referralReward.findMany({
            where: {
                referrer_id: referrerId,
                status: 'pending'
            }
        });
        let totalPaid = 0;
        for (const reward of pendingRewards) {
            try {
                // Add reward to user's USDT wallet (simplified)
                const usdtWallet = await database_1.prisma.wallet.findFirst({
                    where: {
                        user_id: referrerId,
                        coin_type: 'USDT',
                        is_active: true
                    }
                });
                if (usdtWallet) {
                    await database_1.prisma.wallet.update({
                        where: { id: usdtWallet.id },
                        data: {
                            balance: { increment: reward.amount },
                            updated_at: new Date()
                        }
                    });
                    // Mark reward as paid
                    await database_1.prisma.referralReward.update({
                        where: { id: reward.id },
                        data: {
                            status: 'paid',
                            paid_at: new Date()
                        }
                    });
                    totalPaid += reward.amount;
                }
            }
            catch (error) {
                console.error(`Failed to pay reward ${reward.id}:`, error);
            }
        }
        // Update referral code total rewards
        if (totalPaid > 0) {
            await database_1.prisma.referralCode.update({
                where: { user_id: referrerId },
                data: {
                    total_rewards: { increment: totalPaid }
                }
            });
        }
        return totalPaid;
    }
    async getReferralStats(userId) {
        const [referralCode, referrals, rewards] = await Promise.all([
            this.getReferralCode(userId),
            database_1.prisma.referralRelationship.findMany({
                where: { referrer_id: userId }
            }),
            database_1.prisma.referralReward.findMany({
                where: { referrer_id: userId }
            })
        ]);
        const totalReferrals = referrals.length;
        const activeReferrals = referrals.filter(r => r.status === 'pending').length;
        const completedReferrals = referrals.filter(r => r.status === 'completed').length;
        const totalRewards = rewards
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + r.amount, 0);
        const pendingRewards = rewards
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.amount, 0);
        // Monthly referrals (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const monthlyReferrals = referrals.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;
        // Top referrer (more than 10 referrals)
        const topReferrer = totalReferrals >= 10;
        return {
            totalReferrals,
            activeReferrals,
            completedReferrals,
            totalRewards,
            pendingRewards,
            monthlyReferrals,
            topReferrer
        };
    }
    async generateUniqueReferralCode() {
        let code;
        let isUnique = false;
        let attempts = 0;
        do {
            // Generate 8-character code
            code = (0, uuid_1.v4)().replace(/-/g, '').substring(0, 8).toUpperCase();
            const existing = await database_1.prisma.referralCode.findFirst({
                where: { code: code }
            });
            isUnique = !existing;
            attempts++;
            if (attempts > 10) {
                throw (0, error_middleware_1.createError)('Failed to generate unique referral code', 500);
            }
        } while (!isUnique);
        return code;
    }
}
exports.default = new ReferralService();
//# sourceMappingURL=referral.service.js.map