"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class StakingService {
    constructor() {
        this.STAKING_POOLS = [
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
    }
    async getStakingPools() {
        return this.STAKING_POOLS.filter(pool => pool.isActive);
    }
    async getStakingPool(coinType) {
        return this.STAKING_POOLS.find(pool => pool.coinType === coinType && pool.isActive) || null;
    }
    async createStakingPosition(userId, walletId, amount, lockPeriod) {
        // Get wallet and validate
        const wallet = await database_1.prisma.wallet.findFirst({
            where: {
                id: walletId,
                user_id: userId,
                is_active: true
            }
        });
        if (!wallet) {
            throw (0, error_middleware_1.createError)('Wallet not found', 404);
        }
        // Get staking pool
        const pool = await this.getStakingPool(wallet.coin_type);
        if (!pool) {
            throw (0, error_middleware_1.createError)('Staking not available for this coin', 400);
        }
        // Validate amount
        if (amount < pool.minStakeAmount) {
            throw (0, error_middleware_1.createError)(`Minimum stake amount is ${pool.minStakeAmount} ${wallet.coin_type}`, 400);
        }
        if (amount > pool.maxStakeAmount) {
            throw (0, error_middleware_1.createError)(`Maximum stake amount is ${pool.maxStakeAmount} ${wallet.coin_type}`, 400);
        }
        // Validate lock period
        if (!pool.lockPeriodOptions.includes(lockPeriod)) {
            throw (0, error_middleware_1.createError)(`Invalid lock period. Options: ${pool.lockPeriodOptions.join(', ')} days`, 400);
        }
        // Check wallet balance (simplified - should use blockchain service)
        if (wallet.balance < amount) {
            throw (0, error_middleware_1.createError)('Insufficient balance', 400);
        }
        // Calculate APY based on lock period (longer = higher APY)
        const apyMultiplier = 1 + (lockPeriod / 365) * 0.5; // Up to 50% bonus for 1 year
        const adjustedApy = pool.apy * apyMultiplier;
        // Create staking position
        const stakingPosition = await database_1.prisma.stakingPosition.create({
            data: {
                user_id: userId,
                wallet_id: walletId,
                coin_type: wallet.coin_type,
                amount: amount,
                apy: adjustedApy,
                rewards: 0,
                start_date: new Date(),
                end_date: new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000),
                status: 'active',
                lock_period: lockPeriod
            }
        });
        // Update wallet balance (move to staking)
        await database_1.prisma.wallet.update({
            where: { id: walletId },
            data: {
                balance: wallet.balance - amount,
                updated_at: new Date()
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
            walletId: stakingPosition.wallet_id,
            coinType: stakingPosition.coin_type,
            amount: stakingPosition.amount,
            apy: stakingPosition.apy,
            rewards: stakingPosition.rewards,
            startDate: stakingPosition.start_date,
            endDate: stakingPosition.end_date || undefined,
            status: stakingPosition.status,
            lockPeriod: stakingPosition.lock_period
        };
    }
    async getUserStakingPositions(userId) {
        const positions = await database_1.prisma.stakingPosition.findMany({
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
            walletId: pos.wallet_id,
            coinType: pos.coin_type,
            amount: pos.amount,
            apy: pos.apy,
            rewards: pos.rewards,
            startDate: pos.start_date,
            endDate: pos.end_date || undefined,
            status: pos.status,
            lockPeriod: pos.lock_period
        }));
    }
    async getStakingPosition(userId, positionId) {
        const position = await database_1.prisma.stakingPosition.findFirst({
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
            walletId: position.wallet_id,
            coinType: position.coin_type,
            amount: position.amount,
            apy: position.apy,
            rewards: position.rewards,
            startDate: position.start_date,
            endDate: position.end_date || undefined,
            status: position.status,
            lockPeriod: position.lock_period
        };
    }
    async calculateRewards(positionId) {
        const position = await database_1.prisma.stakingPosition.findUnique({
            where: { id: positionId }
        });
        if (!position || position.status !== 'active') {
            return 0;
        }
        const now = new Date();
        const endDate = position.end_date || now;
        const stakingDays = Math.min(Math.floor((now.getTime() - position.start_date.getTime()) / (1000 * 60 * 60 * 24)), Math.floor((endDate.getTime() - position.start_date.getTime()) / (1000 * 60 * 60 * 24)));
        // Calculate rewards: amount * APY * (days / 365)
        const rewards = position.amount * (position.apy / 100) * (stakingDays / 365);
        return rewards;
    }
    async updateRewards(positionId) {
        const rewards = await this.calculateRewards(positionId);
        await database_1.prisma.stakingPosition.update({
            where: { id: positionId },
            data: {
                rewards: rewards,
                updated_at: new Date()
            }
        });
    }
    async withdrawStakingPosition(userId, positionId) {
        const position = await database_1.prisma.stakingPosition.findFirst({
            where: {
                id: positionId,
                user_id: userId
            },
            include: {
                wallet: true
            }
        });
        if (!position) {
            throw (0, error_middleware_1.createError)('Staking position not found', 404);
        }
        if (position.status !== 'active') {
            throw (0, error_middleware_1.createError)('Staking position is not active', 400);
        }
        const now = new Date();
        const isEarlyWithdrawal = position.end_date && now < position.end_date;
        if (isEarlyWithdrawal) {
            // Apply penalty for early withdrawal (lose 50% of rewards)
            const rewards = await this.calculateRewards(positionId);
            const penaltyRewards = rewards * 0.5;
            // Update position
            await database_1.prisma.stakingPosition.update({
                where: { id: positionId },
                data: {
                    status: 'withdrawn',
                    rewards: penaltyRewards,
                    updated_at: new Date()
                }
            });
            // Return principal + penalty rewards
            const total = position.amount + penaltyRewards;
            // Update wallet balance
            await database_1.prisma.wallet.update({
                where: { id: position.wallet_id },
                data: {
                    balance: position.wallet.balance + total,
                    updated_at: new Date()
                }
            });
            return {
                amount: position.amount,
                rewards: penaltyRewards,
                total: total
            };
        }
        else {
            // Full withdrawal
            const rewards = await this.calculateRewards(positionId);
            // Update position
            await database_1.prisma.stakingPosition.update({
                where: { id: positionId },
                data: {
                    status: 'completed',
                    rewards: rewards,
                    updated_at: new Date()
                }
            });
            const total = position.amount + rewards;
            // Update wallet balance
            await database_1.prisma.wallet.update({
                where: { id: position.wallet_id },
                data: {
                    balance: position.wallet.balance + total,
                    updated_at: new Date()
                }
            });
            // Update pool total staked
            const pool = await this.getStakingPool(position.coin_type);
            if (pool) {
                const poolIndex = this.STAKING_POOLS.findIndex(p => p.id === pool.id);
                if (poolIndex !== -1) {
                    this.STAKING_POOLS[poolIndex].totalStaked -= position.amount;
                }
            }
            return {
                amount: position.amount,
                rewards: rewards,
                total: total
            };
        }
    }
    async getStakingSummary(userId) {
        const positions = await database_1.prisma.stakingPosition.findMany({
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
            totalStaked += position.amount;
            if (position.status === 'active') {
                activePositions++;
                const rewards = await this.calculateRewards(position.id);
                totalRewards += rewards;
                projectedAnnualRewards += position.amount * (position.apy / 100);
            }
            else {
                completedPositions++;
                totalRewards += position.rewards;
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
    async updateAllRewards() {
        // This would typically be run as a cron job daily
        const activePositions = await database_1.prisma.stakingPosition.findMany({
            where: {
                status: 'active'
            }
        });
        for (const position of activePositions) {
            await this.updateRewards(position.id);
        }
    }
}
exports.default = new StakingService();
//# sourceMappingURL=staking.service.js.map