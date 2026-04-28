import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private supabaseAdmin: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = process.env['SUPABASE_URL'];
    const anonKey = process.env['SUPABASE_ANON_KEY'];
    const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    // Only initialize Supabase if environment variables are set
    if (supabaseUrl && anonKey) {
      // Client for user operations (uses anon key)
      this.supabase = createClient(supabaseUrl, anonKey);
    }

    if (supabaseUrl && serviceRoleKey) {
      // Admin client for privileged operations (uses service role key)
      this.supabaseAdmin = createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }

    if (!this.supabase || !this.supabaseAdmin) {
      console.warn('⚠️ Supabase not configured. Some features may not work.');
    }
  }

  // Get the standard client (for user operations)
  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  // Get the admin client (for privileged operations)
  getAdminClient(): SupabaseClient | null {
    return this.supabaseAdmin;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    if (!this.supabaseAdmin) {
      console.warn('⚠️ Supabase admin client not configured');
      return false;
    }

    try {
      const { data, error } = await this.supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    if (!this.supabaseAdmin) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const { error } = await this.supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get database info
  async getDatabaseInfo(): Promise<{ version: string; connection: string }> {
    if (!this.supabaseAdmin) {
      return {
        version: 'PostgreSQL (Supabase)',
        connection: 'Not configured'
      };
    }

    try {
      const { data, error } = await this.supabaseAdmin
        .rpc('get_database_info');
      
      if (error) {
        // Fallback if RPC doesn't exist
        return {
          version: 'PostgreSQL (Supabase)',
          connection: 'Connected via Supabase'
        };
      }
      
      return data || {
        version: 'PostgreSQL (Supabase)',
        connection: 'Connected via Supabase'
      };
    } catch (error) {
      return {
        version: 'PostgreSQL (Supabase)',
        connection: 'Connected via Supabase'
      };
    }
  }
}

export default new SupabaseService();
