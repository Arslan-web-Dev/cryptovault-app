import { supabaseService } from '../config/database';
import { createError } from '../middleware/error.middleware';

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

class SupabaseDbService {
  private adminClient = supabaseService.getAdminClient();

  // ==================== USER OPERATIONS ====================

  async createUser(userData: {
    email: string;
    full_name: string;
    password_hash: string;
    phone?: string;
    country?: string;
  }): Promise<SupabaseUser> {
    try {
      const { data, error } = await this.adminClient
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        throw createError(`Failed to create user: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('User creation failed', 500);
    }
  }

  async getUserById(userId: string): Promise<SupabaseUser | null> {
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
        throw createError(`Failed to get user: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('User retrieval failed', 500);
    }
  }

  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
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
        throw createError(`Failed to get user: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('User retrieval failed', 500);
    }
  }

  async updateUser(userId: string, updateData: Partial<SupabaseUser>): Promise<SupabaseUser> {
    try {
      const { data, error } = await this.adminClient
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw createError(`Failed to update user: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('User update failed', 500);
    }
  }

  // ==================== WALLET OPERATIONS ====================

  async createWallet(walletData: {
    user_id: string;
    wallet_address: string;
    coin_type: 'BTC' | 'ETH' | 'SOL' | 'USDT';
    private_key_encrypted: string;
    wallet_name: string;
    is_default: boolean;
  }): Promise<SupabaseWallet> {
    try {
      const { data, error } = await this.adminClient
        .from('wallets')
        .insert([walletData])
        .select()
        .single();

      if (error) {
        throw createError(`Failed to create wallet: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('Wallet creation failed', 500);
    }
  }

  async getUserWallets(userId: string): Promise<SupabaseWallet[]> {
    try {
      const { data, error } = await this.adminClient
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw createError(`Failed to get wallets: ${error.message}`, 500);
      }

      return data || [];
    } catch (error) {
      throw createError('Wallet retrieval failed', 500);
    }
  }

  async getWalletById(walletId: string, userId: string): Promise<SupabaseWallet | null> {
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
        throw createError(`Failed to get wallet: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('Wallet retrieval failed', 500);
    }
  }

  async updateWallet(walletId: string, userId: string, updateData: Partial<SupabaseWallet>): Promise<SupabaseWallet> {
    try {
      const { data, error } = await this.adminClient
        .from('wallets')
        .update(updateData)
        .eq('id', walletId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw createError(`Failed to update wallet: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('Wallet update failed', 500);
    }
  }

  // ==================== TRANSACTION OPERATIONS ====================

  async createTransaction(transactionData: {
    user_id: string;
    wallet_id: string;
    transaction_hash: string;
    type: 'send' | 'receive' | 'swap';
    from_address: string;
    to_address: string;
    amount: number;
    fee: number;
    status: 'pending' | 'confirmed' | 'failed';
  }): Promise<any> {
    try {
      const { data, error } = await this.adminClient
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        throw createError(`Failed to create transaction: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      throw createError('Transaction creation failed', 500);
    }
  }

  async getUserTransactions(userId: string, walletId?: string, page: number = 1, limit: number = 10): Promise<{
    transactions: any[];
    total: number;
    totalPages: number;
  }> {
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
        throw createError(`Failed to get transactions: ${error.message}`, 500);
      }

      return {
        transactions: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      throw createError('Transaction retrieval failed', 500);
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToWalletUpdates(userId: string, callback: (payload: any) => void) {
    return this.adminClient
      .channel('wallet_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToTransactionUpdates(userId: string, callback: (payload: any) => void) {
    return this.adminClient
      .channel('transaction_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
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
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'Supabase PostgreSQL',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== ANALYTICS ====================

  async getUserStats(userId: string): Promise<{
    totalWallets: number;
    totalTransactions: number;
    activeWallets: number;
  }> {
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
    } catch (error) {
      throw createError('Failed to get user stats', 500);
    }
  }
}

export default new SupabaseDbService();
