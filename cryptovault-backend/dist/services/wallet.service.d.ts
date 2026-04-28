import { CoinType } from '@prisma/client';
interface CreateWalletRequest {
    coinType: CoinType;
    walletName?: string;
    userId: string;
}
declare class WalletService {
    createWallet(request: CreateWalletRequest): Promise<{
        wallet: {
            id: string;
            created_at: Date;
            wallet_address: string;
            coin_type: import(".prisma/client").$Enums.CoinType;
            wallet_name: string | null;
            is_default: boolean;
        };
        backup_phrase: string;
    }>;
    getUserWallets(userId: string): Promise<{
        wallets: {
            balance: string;
            usd_value: number;
            last_updated: Date;
            id: string;
            created_at: Date;
            wallet_address: string;
            coin_type: import(".prisma/client").$Enums.CoinType;
            wallet_name: string | null;
            is_default: boolean;
        }[];
        total_usd_value: number;
    }>;
    getWalletBalance(walletId: string, userId: string): Promise<{
        balance: string;
        usd_value: number;
        last_updated: Date;
    }>;
    updateWalletName(walletId: string, userId: string, newName: string): Promise<{
        id: string;
        updated_at: Date;
        coin_type: import(".prisma/client").$Enums.CoinType;
        wallet_name: string | null;
    }>;
    setDefaultWallet(walletId: string, userId: string): Promise<{
        id: string;
        coin_type: import(".prisma/client").$Enums.CoinType;
        wallet_name: string | null;
        is_default: boolean;
    }>;
    deleteWallet(walletId: string, userId: string): Promise<{
        message: string;
    }>;
    getWalletTransactions(walletId: string, userId: string, page?: number, limit?: number): Promise<{
        transactions: {
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            created_at: Date;
            fee: import("@prisma/client-runtime-utils").Decimal;
            transaction_hash: string | null;
            from_address: string;
            to_address: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            completed_at: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    }>;
    validateAddress(address: string, coinType: CoinType): Promise<boolean>;
    getPortfolioSummary(userId: string): Promise<{
        total_value: number;
        total_profit: number;
        profit_percentage: number;
        allocation: {
            coin: string;
            value: number;
            percentage: number;
        }[];
    }>;
}
declare const _default: WalletService;
export default _default;
//# sourceMappingURL=wallet.service.d.ts.map