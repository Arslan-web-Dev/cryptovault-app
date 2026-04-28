import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';
import { CoinType } from '@prisma/client';

export interface StakingPosition {
  id: string;
  userId: string;
  coinType: CoinType;
  amount: number;
  apy: number;
  rewards: number;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
  lockPeriod: number; // in days
}

export interface StakingPool {
  id: string;
  coinType: CoinType;
  totalStaked: number;
  apy: number;
  minStakeAmount: number;
  maxStakeAmount: number;
  lockPeriodOptions: number[];
  isActive: boolean;
}

class StakingService {
  private readonly STAKING_POOLS: StakingPool[] = [
    {
      id: 'btc-pool',
      coinType: 'BTC',
      totalStaked: 125.5,
      apy: 5.2,
      minStakeAmount: 0.001,
      maxStakeAmount: 50,
      lockPeriodOptions: [30, 90, 180, 365],
      isActive: true
    },
    {
      id: 'eth-pool',
      coinType: 'ETH',
      totalStaked: 850.3,
      apy: 4.8,
      minStakeAmount: 0.01,
      maxStakeAmount: 100,
      lockPeriodOptions: [30, 90, 180, 365],
      isActive: true
    },
    {
      id: 'sol-pool',
      coinType: 'SOL',
      totalStaked: 5200.8,
      apy: 7.5,
      minStakeAmount: 1,
      maxStakeAmount: 1000,
      lockPeriodOptions: [30, 90, 180, 365],
      isActive: true
    },
    {
      id: 'usdt-pool',
      coinType: 'USDT',
      totalStaked: 50000,
      apy: 8.2,
      minStakeAmount: 10,
      maxStakeAmount: 10000,
      lockPeriodOptions: [30, 90, 180, 365],
      isActive: true
    }
  ];

  async getStakingPools(): Promise<StakingPool[]> {
    return this.STAKING_POOLS.filter(pool => pool.isActive);
  }

  async getStakingPool(coinType: CoinType): Promise<StakingPool | null> {
    return this.STAKING_POOLS.find(pool => pool.coinType === coinType && pool.isActive) || null;
  }

  async createStakingPosition(userId: string, walletId: string, amount: number, lockPeriod: number): Promise<StakingPosition> {
    // Get wallet and validate
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId,
        is_active: true
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    // Get staking pool
    const pool = await this.getStakingPool(wallet.coin_type);
    if (!pool) {
      throw createError('Staking not available for this coin', 400);
    }

    // Validate amount
    if (amount < pool.minStakeAmount) {
      throw createError(`Minimum stake amount is ${pool.minStakeAmount} ${wallet.coin_type}`, 400);
    }
    if (amount > pool.maxStakeAmount) {
      throw createError(`Maximum stake amount is ${pool.maxStakeAmount} ${wallet.coin_type}`, 400);
    }

    // Validate lock period
    if (!pool.lockPeriodOptions.includes(lockPeriod)) {
      throw createError(`Invalid lock period. Options: ${pool.lockPeriodOptions.join(', ')} days`, 400);
    }

    // Check wallet balance (simplified - should use blockchain service)
    if (parseFloat(wallet.balance.toString()) < amount) {
      throw createError('Insufficient balance', 400);
    }

    // Calculate APY based on lock period (longer = higher APY)
    const apyMultiplier = 1 + (lockPeriod / 365) * 0.5; // Up to 50% bonus for 1 year
    const adjustedApy = pool.apy * apyMultiplier;

    // Create staking position
    const stakingPosition = await prisma.stakingPosition.create({
      data: {
        user_id: userId,
        pool_id: walletId,
        pool_name: `${wallet.coin_type} Pool`,
        coin_type: wallet.coin_type,
        amount: amount,
        apy: adjustedApy,
        rewards_earned: 0,
        start_date: new Date(),
        end_date: new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000),
        status: 'ACTIVE' as any,
        lock_period: lockPeriod
      }
    });

    // Update wallet balance (move to staking)
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { decrement: amount }
      }
    });

    // Update pool total staked
    const poolIndex = this.STAKING_POOLS.findIndex(p => p.id === pool.id);
    if (poolIndex !== -1) {
      this.STAKING_POOLS[poolIndex].totalStaked += amount;
    }

    return {
      id: stakingPosition.id,
      userId: stakingPosition.user_id,
      coinType: stakingPosition.coin_type,
      amount: parseFloat(stakingPosition.amount.toString()),
      apy: parseFloat(stakingPosition.apy.toString()),
      rewards: parseFloat(stakingPosition.rewards_earned.toString()),
      startDate: stakingPosition.start_date,
      endDate: stakingPosition.end_date || undefined,
      status: stakingPosition.status as 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN',
      lockPeriod: stakingPosition.lock_period
    };
  }

  async getUserStakingPositions(userId: string): Promise<StakingPosition[]> {
    const positions = await prisma.stakingPosition.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return positions.map(pos => ({
      id: pos.id,
      userId: pos.user_id,
      coinType: pos.coin_type,
      amount: parseFloat(pos.amount.toString()),
      apy: parseFloat(pos.apy.toString()),
      rewards: parseFloat(pos.rewards_earned.toString()),
      startDate: pos.start_date,
      endDate: pos.end_date || undefined,
      status: pos.status as 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN',
      lockPeriod: pos.lock_period
    }));
  }

  async getStakingPosition(userId: string, positionId: string): Promise<StakingPosition | null> {
    const position = await prisma.stakingPosition.findFirst({
      where: {
        id: positionId,
        user_id: userId
      }
    });

    if (!position) {
      return null;
    }

    return {
      id: position.id,
      userId: position.user_id,
      coinType: position.coin_type,
      amount: parseFloat(position.amount.toString()),
      apy: parseFloat(position.apy.toString()),
      rewards: parseFloat(position.rewards_earned.toString()),
      startDate: position.start_date,
      endDate: position.end_date || undefined,
      status: position.status as 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN',
      lockPeriod: position.lock_period
    };
  }

  async calculateRewards(positionId: string): Promise<number> {
    const position = await prisma.stakingPosition.findUnique({
      where: { id: positionId }
    });

    if (!position || position.status !== 'ACTIVE') {
      return 0;
    }

    const now = new Date();
    const endDate = position.end_date || now;
    const stakingDays = Math.floor((endDate.getTime() - position.start_date.getTime()) / (1000 * 60 * 60 * 24));
    const rewards = parseFloat(position.amount.toString()) * (parseFloat(position.apy.toString()) / 100) * (stakingDays / 365);

    // Update rewards in database
    await prisma.stakingPosition.update({
      where: { id: positionId },
      data: {
        rewards_earned: rewards,
        last_compound: new Date()
      }
    });

    return rewards;
  }

  async updateRewards(positionId: string): Promise<void> {
    await this.calculateRewards(positionId);
  }

  async withdrawStakingPosition(userId: string, positionId: string): Promise<{ amount: number; rewards: number; total: number }> {
    const position = await prisma.stakingPosition.findFirst({
      where: {
        id: positionId,
        user_id: userId
      }
    });

    if (!position) {
      throw createError('Staking position not found', 404);
    }

    if (position.status !== 'ACTIVE') {
      throw createError('Staking position is not active', 400);
    }

    const now = new Date();
    const isEarlyWithdrawal = position.end_date && now < position.end_date;

    if (isEarlyWithdrawal) {
      // Apply penalty for early withdrawal (lose 50% of rewards)
      const rewards = await this.calculateRewards(positionId);
      const penaltyRewards = rewards * 0.5;

      // Update position
      await prisma.stakingPosition.update({
        where: { id: positionId },
        data: {
          status: 'WITHDRAWN' as any,
          rewards: penaltyRewards
        }
      });

      // Return principal + penalty rewards
      const total = parseFloat(position.amount.toString()) + penaltyRewards;

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: positionId },
        data: {
          balance: { increment: total }
        }
      });

      return {
        amount: parseFloat(position.amount.toString()),
        rewards: penaltyRewards,
        total: total
      };
    } else {
      // Full withdrawal
      const rewards = await this.calculateRewards(positionId);

      // Update position
      await prisma.stakingPosition.update({
        where: { id: positionId },
        data: {
          status: 'COMPLETED' as any,
          rewards: rewards
        }
      });

      // Return principal + full rewards
      const total = parseFloat(position.amount.toString()) + rewards;

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: positionId },
        data: {
          balance: { increment: total }
        }
      });

      return {
        amount: parseFloat(position.amount.toString()),
        rewards: rewards,
        total: total
      };
    }
  }

  async getStakingSummary(userId: string): Promise<{
    totalStaked: number;
    totalRewards: number;
    activePositions: number;
    completedPositions: number;
    projectedAnnualRewards: number;
  }> {
    const positions = await prisma.stakingPosition.findMany({
      where: {
        user_id: userId
      }
    });

    let totalStaked = 0;
    let totalRewards = 0;
    let activePositions = 0;
    let completedPositions = 0;
    let projectedAnnualRewards = 0;

    for (const position of positions) {
      totalStaked += parseFloat(position.amount.toString());
      
      if (position.status === 'ACTIVE') {
        activePositions++;
        const rewards = await this.calculateRewards(position.id);
        totalRewards += rewards;
        projectedAnnualRewards += parseFloat(position.amount.toString()) * (parseFloat(position.apy.toString()) / 100);
      } else {
        completedPositions++;
        totalRewards += parseFloat(position.rewards_earned?.toString() || '0');
      }
    }

    return {
      totalStaked,
      totalRewards,
      activePositions,
      completedPositions,
      projectedAnnualRewards
    };
  }

  async updateAllRewards(): Promise<void> {
    // This would typically be run as a cron job daily
    const activePositions = await prisma.stakingPosition.findMany({
      where: {
        status: 'ACTIVE' as any
      }
    });

    for (const position of activePositions) {
      await this.updateRewards(position.id);
    }
  }
}

export default new StakingService();
