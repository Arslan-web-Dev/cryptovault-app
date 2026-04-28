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
declare class ReferralService {
    private readonly REFERRAL_BONUSES;
    createReferralCode(userId: string): Promise<ReferralCode>;
    getReferralCode(userId: string): Promise<ReferralCode | null>;
    validateReferralCode(code: string): Promise<{
        valid: boolean;
        referrerId?: string;
    }>;
    applyReferralCode(userId: string, referralCode: string): Promise<ReferralRelationship>;
    completeReferral(referredId: string): Promise<void>;
    createReferralReward(referralId: string, referrerId: string, amount: number, type: 'signup' | 'trade' | 'staking' | 'deposit', description: string): Promise<ReferralReward>;
    getUserReferrals(userId: string): Promise<{
        referralCode: ReferralCode | null;
        referrals: ReferralRelationship[];
        totalRewards: number;
        pendingRewards: number;
    }>;
    trackTradeReferral(userId: string, tradeVolume: number): Promise<void>;
    trackStakingReferral(userId: string, stakingRewards: number): Promise<void>;
    trackDepositReferral(userId: string, depositAmount: number): Promise<void>;
    payReferralRewards(referrerId: string): Promise<number>;
    getReferralStats(userId: string): Promise<{
        totalReferrals: number;
        activeReferrals: number;
        completedReferrals: number;
        totalRewards: number;
        pendingRewards: number;
        monthlyReferrals: number;
        topReferrer: boolean;
    }>;
    private generateUniqueReferralCode;
}
declare const _default: ReferralService;
export default _default;
//# sourceMappingURL=referral.service.d.ts.map