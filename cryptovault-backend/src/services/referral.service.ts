import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  isActive: boolean;
  totalReferrals: number;
  totalRewards: number;
  createdAt: Date;
}

export interface ReferralRelationship {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardAmount: number;
  rewardType: 'percentage' | 'fixed';
  completedAt?: Date;
  rewardedAt?: Date;
}

export interface ReferralReward {
  id: string;
  referralId: string;
  referrerId: string;
  amount: number;
  type: 'signup' | 'trade' | 'staking' | 'deposit';
  description: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: Date;
  paidAt?: Date;
}

class ReferralService {
  private readonly REFERRAL_BONUSES = {
    signup: 10, // $10 for successful referral signup
    trade: 0.001, // 0.1% of trading volume
    staking: 0.05, // 5% of staking rewards
    deposit: 0.01 // 1% of first deposit (up to $100)
  };

  async createReferralCode(userId: string): Promise<ReferralCode> {
    // Check if user already has a referral code
    const existingCode = await prisma.referralCode.findFirst({
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

    const referralCode = await prisma.referralCode.create({
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

  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    const referralCode = await prisma.referralCode.findFirst({
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

  async validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string }> {
    const referralCode = await prisma.referralCode.findFirst({
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

  async applyReferralCode(userId: string, referralCode: string): Promise<ReferralRelationship> {
    // Validate referral code
    const validation = await this.validateReferralCode(referralCode);
    if (!validation.valid) {
      throw createError('Invalid referral code', 400);
    }

    // Check if user was already referred
    const existingReferral = await (prisma as any).referralRelationship.findFirst({
      where: { referred_id: userId }
    });

    if (existingReferral) {
      throw createError('User was already referred', 400);
    }

    // Cannot refer yourself
    if (validation.referrerId === userId) {
      throw createError('Cannot refer yourself', 400);
    }

    // Create referral relationship
    const referral = await prisma.referralRelationship.create({
      data: {
        referrer_id: validation.referrerId!,
        referred_id: userId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending',
        reward_amount: this.REFERRAL_BONUSES.signup,
        reward_type: 'fixed'
      }
    });

    // Update referral code stats
    await (prisma as any).referralCode.update({
      where: { id: validation.referrerId! },
      data: {
        total_referrals: { increment: 1 }
      }
    });

    return {
      id: referral.id,
      referrerId: referral.referrer_id,
      referredId: referral.referred_id,
      referralCode: referral.referral_code,
      status: referral.status as 'pending' | 'completed' | 'rewarded',
      rewardAmount: referral.reward_amount,
      rewardType: referral.reward_type as 'percentage' | 'fixed',
      completedAt: referral.completed_at || undefined,
      rewardedAt: referral.rewarded_at || undefined
    };
  }

  async completeReferral(referredId: string): Promise<void> {
    const referral = await (prisma as any).referralRelationship.findFirst({
      where: {
        referred_id: referredId,
        status: 'pending'
      }
    });

    if (!referral) {
      return;
    }

    // Update referral status
    await (prisma as any).referralRelationship.update({
      where: { id: referral.id },
      data: {
        status: 'completed',
        completed_at: new Date()
      }
    });

    // Create reward
    await this.createReferralReward(
      referral.id,
      referral.referrer_id,
      this.REFERRAL_BONUSES.signup,
      'signup',
      'Successful referral signup bonus'
    );

    // Update referral code total rewards
    await (prisma as any).referralCode.update({
      where: { user_id: referral.referrer_id },
      data: {
        total_rewards: { increment: this.REFERRAL_BONUSES.signup }
      }
    });
  }

  async createReferralReward(
    referralId: string,
    referrerId: string,
    amount: number,
    type: 'signup' | 'trade' | 'staking' | 'deposit',
    description: string
  ): Promise<ReferralReward> {
    const reward = await (prisma as any).referralReward.create({
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
      status: reward.status as 'pending' | 'paid' | 'expired',
      createdAt: reward.created_at,
      paidAt: reward.paid_at || undefined
    };
  }

  async getUserReferrals(userId: string): Promise<{
    referralCode: ReferralCode | null;
    referrals: ReferralRelationship[];
    totalRewards: number;
    pendingRewards: number;
  }> {
    const [referralCode, referrals, rewards] = await Promise.all([
      this.getReferralCode(userId),
      (prisma as any).referralRelationship.findMany({
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
      (prisma as any).referralReward.findMany({
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
      status: referral.status as 'pending' | 'completed' | 'rewarded',
      rewardAmount: referral.reward_amount,
      rewardType: referral.reward_type as 'percentage' | 'fixed',
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

  async trackTradeReferral(userId: string, tradeVolume: number): Promise<void> {
    // Check if user was referred
    const referral = await (prisma as any).referralRelationship.findFirst({
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
    await this.createReferralReward(
      referral.id,
      referral.referrer_id,
      rewardAmount,
      'trade',
      `Trade referral bonus: ${tradeVolume} volume`
    );
  }

  async trackStakingReferral(userId: string, stakingRewards: number): Promise<void> {
    // Check if user was referred
    const referral = await (prisma as any).referralRelationship.findFirst({
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
    await this.createReferralReward(
      referral.id,
      referral.referrer_id,
      rewardAmount,
      'staking',
      `Staking referral bonus: ${stakingRewards} rewards`
    );
  }

  async trackDepositReferral(userId: string, depositAmount: number): Promise<void> {
    // Check if user was referred and this is their first deposit
    const referral = await (prisma as any).referralRelationship.findFirst({
      where: {
        referred_id: userId,
        status: 'completed'
      }
    });

    if (!referral) {
      return;
    }

    // Check if user has previous deposits (simplified)
    const hasPreviousDeposits = await prisma.transaction.findFirst({
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
    await this.createReferralReward(
      referral.id,
      referral.referrer_id,
      rewardAmount,
      'deposit',
      `First deposit referral bonus: ${depositAmount} deposit`
    );
  }

  async payReferralRewards(referrerId: string): Promise<number> {
    const pendingRewards = await (prisma as any).referralReward.findMany({
      where: {
        referrer_id: referrerId,
        status: 'pending'
      }
    });

    let totalPaid = 0;

    for (const reward of pendingRewards) {
      try {
        // Add reward to user's USDT wallet (simplified)
        const usdtWallet = await prisma.wallet.findFirst({
          where: {
            user_id: referrerId,
            coin_type: 'USDT',
            is_active: true
          }
        });

        if (usdtWallet) {
          await prisma.wallet.update({
            where: { id: usdtWallet.id },
            data: {
              balance: { increment: reward.amount },
              updated_at: new Date()
            }
          });

          // Mark reward as paid
          await prisma.referralReward.update({
            where: { id: reward.id },
            data: {
              status: 'paid',
              paid_at: new Date()
            }
          });

          totalPaid += reward.amount;
        }
      } catch (error) {
        console.error(`Failed to pay reward ${reward.id}:`, error);
      }
    }

    // Update referral code total rewards
    if (totalPaid > 0) {
      await (prisma as any).referralCode.update({
        where: { user_id: referrerId },
        data: {
          total_rewards: { increment: totalPaid }
        }
      });
    }

    return totalPaid;
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    completedReferrals: number;
    totalRewards: number;
    pendingRewards: number;
    monthlyReferrals: number;
    topReferrer: boolean;
  }> {
    const [referralCode, referrals, rewards] = await Promise.all([
      this.getReferralCode(userId),
      (prisma as any).referralRelationship.findMany({
        where: { referrer_id: userId }
      }),
      (prisma as any).referralReward.findMany({
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
    const monthlyReferrals = referrals.filter(r => 
      new Date(r.created_at) > thirtyDaysAgo
    ).length;

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

  private async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    let attempts = 0;

    do {
      // Generate 8-character code
      code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
      
      const existing = await prisma.referralCode.findFirst({
        where: { code: code }
      });

      isUnique = !existing;
      attempts++;

      if (attempts > 10) {
        throw createError('Failed to generate unique referral code', 500);
      }
    } while (!isUnique);

    return code;
  }
}

export default new ReferralService();
