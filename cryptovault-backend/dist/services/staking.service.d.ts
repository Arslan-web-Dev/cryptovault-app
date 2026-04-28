import { CoinType } from '@prisma/client';
export interface StakingPosition {
    id: string;
    userId: string;
    walletId: string;
    coinType: CoinType;
    amount: number;
    apy: number;
    rewards: number;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'withdrawn';
    lockPeriod: number;
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
declare class StakingService {
    private readonly STAKING_POOLS;
    getStakingPools(): Promise<StakingPool[]>;
    getStakingPool(coinType: CoinType): Promise<StakingPool | null>;
    createStakingPosition(userId: string, walletId: string, amount: number, lockPeriod: number): Promise<StakingPosition>;
    getUserStakingPositions(userId: string): Promise<StakingPosition[]>;
    getStakingPosition(userId: string, positionId: string): Promise<StakingPosition | null>;
    calculateRewards(positionId: string): Promise<number>;
    updateRewards(positionId: string): Promise<void>;
    withdrawStakingPosition(userId: string, positionId: string): Promise<{
        amount: number;
        rewards: number;
        total: number;
    }>;
    getStakingSummary(userId: string): Promise<{
        totalStaked: number;
        totalRewards: number;
        activePositions: number;
        completedPositions: number;
        projectedAnnualRewards: number;
    }>;
    updateAllRewards(): Promise<void>;
}
declare const _default: StakingService;
export default _default;
//# sourceMappingURL=staking.service.d.ts.map