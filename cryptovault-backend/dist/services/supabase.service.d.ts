export interface SupabaseUser {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    country?: string;
    kyc_level: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface SupabaseWallet {
    id: string;
    user_id: string;
    wallet_address: string;
    coin_type: 'BTC' | 'ETH' | 'SOL' | 'USDT';
    wallet_name: string;
    balance: number;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
declare class SupabaseDbService {
    private adminClient;
    createUser(userData: {
        email: string;
        full_name: string;
        password_hash: string;
        phone?: string;
        country?: string;
    }): Promise<SupabaseUser>;
    getUserById(userId: string): Promise<SupabaseUser | null>;
    getUserByEmail(email: string): Promise<SupabaseUser | null>;
    updateUser(userId: string, updateData: Partial<SupabaseUser>): Promise<SupabaseUser>;
    createWallet(walletData: {
        user_id: string;
        wallet_address: string;
        coin_type: 'BTC' | 'ETH' | 'SOL' | 'USDT';
        private_key_encrypted: string;
        wallet_name: string;
        is_default: boolean;
    }): Promise<SupabaseWallet>;
    getUserWallets(userId: string): Promise<SupabaseWallet[]>;
    getWalletById(walletId: string, userId: string): Promise<SupabaseWallet | null>;
    updateWallet(walletId: string, userId: string, updateData: Partial<SupabaseWallet>): Promise<SupabaseWallet>;
    createTransaction(transactionData: {
        user_id: string;
        wallet_id: string;
        transaction_hash: string;
        type: 'send' | 'receive' | 'swap';
        from_address: string;
        to_address: string;
        amount: number;
        fee: number;
        status: 'pending' | 'confirmed' | 'failed';
    }): Promise<any>;
    getUserTransactions(userId: string, walletId?: string, page?: number, limit?: number): Promise<{
        transactions: any[];
        total: number;
        totalPages: number;
    }>;
    subscribeToWalletUpdates(userId: string, callback: (payload: any) => void): import("@supabase/realtime-js").RealtimeChannel;
    subscribeToTransactionUpdates(userId: string, callback: (payload: any) => void): import("@supabase/realtime-js").RealtimeChannel;
    healthCheck(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
    getUserStats(userId: string): Promise<{
        totalWallets: number;
        totalTransactions: number;
        activeWallets: number;
    }>;
}
declare const _default: SupabaseDbService;
export default _default;
//# sourceMappingURL=supabase.service.d.ts.map