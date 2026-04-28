"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class SupabaseDbService {
    constructor() {
        this.adminClient = database_1.supabaseService.getAdminClient();
    }
    // ==================== USER OPERATIONS ====================
    async createUser(userData) {
        try {
            const { data, error } = await this.adminClient
                .from('users')
                .insert([userData])
                .select()
                .single();
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to create user: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('User creation failed', 500);
        }
    }
    async getUserById(userId) {
        try {
            const { data, error } = await this.adminClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // User not found
                }
                throw (0, error_middleware_1.createError)(`Failed to get user: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('User retrieval failed', 500);
        }
    }
    async getUserByEmail(email) {
        try {
            const { data, error } = await this.adminClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // User not found
                }
                throw (0, error_middleware_1.createError)(`Failed to get user: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('User retrieval failed', 500);
        }
    }
    async updateUser(userId, updateData) {
        try {
            const { data, error } = await this.adminClient
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to update user: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('User update failed', 500);
        }
    }
    // ==================== WALLET OPERATIONS ====================
    async createWallet(walletData) {
        try {
            const { data, error } = await this.adminClient
                .from('wallets')
                .insert([walletData])
                .select()
                .single();
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to create wallet: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Wallet creation failed', 500);
        }
    }
    async getUserWallets(userId) {
        try {
            const { data, error } = await this.adminClient
                .from('wallets')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to get wallets: ${error.message}`, 500);
            }
            return data || [];
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Wallet retrieval failed', 500);
        }
    }
    async getWalletById(walletId, userId) {
        try {
            const { data, error } = await this.adminClient
                .from('wallets')
                .select('*')
                .eq('id', walletId)
                .eq('user_id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Wallet not found
                }
                throw (0, error_middleware_1.createError)(`Failed to get wallet: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Wallet retrieval failed', 500);
        }
    }
    async updateWallet(walletId, userId, updateData) {
        try {
            const { data, error } = await this.adminClient
                .from('wallets')
                .update(updateData)
                .eq('id', walletId)
                .eq('user_id', userId)
                .select()
                .single();
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to update wallet: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Wallet update failed', 500);
        }
    }
    // ==================== TRANSACTION OPERATIONS ====================
    async createTransaction(transactionData) {
        try {
            const { data, error } = await this.adminClient
                .from('transactions')
                .insert([transactionData])
                .select()
                .single();
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to create transaction: ${error.message}`, 500);
            }
            return data;
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Transaction creation failed', 500);
        }
    }
    async getUserTransactions(userId, walletId, page = 1, limit = 10) {
        try {
            let query = this.adminClient
                .from('transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', userId);
            if (walletId) {
                query = query.eq('wallet_id', walletId);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error) {
                throw (0, error_middleware_1.createError)(`Failed to get transactions: ${error.message}`, 500);
            }
            return {
                transactions: data || [],
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            };
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Transaction retrieval failed', 500);
        }
    }
    // ==================== REAL-TIME SUBSCRIPTIONS ====================
    subscribeToWalletUpdates(userId, callback) {
        return this.adminClient
            .channel('wallet_updates')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${userId}`
        }, callback)
            .subscribe();
    }
    subscribeToTransactionUpdates(userId, callback) {
        return this.adminClient
            .channel('transaction_updates')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`
        }, callback)
            .subscribe();
    }
    // ==================== HEALTH CHECK ====================
    async healthCheck() {
        try {
            const { error } = await this.adminClient
                .from('users')
                .select('id')
                .limit(1);
            return {
                status: error ? 'unhealthy' : 'healthy',
                database: 'Supabase PostgreSQL',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                database: 'Supabase PostgreSQL',
                timestamp: new Date().toISOString()
            };
        }
    }
    // ==================== ANALYTICS ====================
    async getUserStats(userId) {
        try {
            const [walletsResult, transactionsResult] = await Promise.all([
                this.adminClient
                    .from('wallets')
                    .select('id', { count: 'exact' })
                    .eq('user_id', userId)
                    .eq('is_active', true),
                this.adminClient
                    .from('transactions')
                    .select('id', { count: 'exact' })
                    .eq('user_id', userId)
            ]);
            return {
                totalWallets: walletsResult.count || 0,
                totalTransactions: transactionsResult.count || 0,
                activeWallets: walletsResult.count || 0
            };
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Failed to get user stats', 500);
        }
    }
}
exports.default = new SupabaseDbService();
//# sourceMappingURL=supabase.service.js.map