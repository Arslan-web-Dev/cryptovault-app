"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseService {
    constructor() {
        // Client for user operations (uses anon key)
        this.supabase = (0, supabase_js_1.createClient)(process.env['SUPABASE_URL'] || '', process.env['SUPABASE_ANON_KEY'] || '');
        // Admin client for privileged operations (uses service role key)
        this.supabaseAdmin = (0, supabase_js_1.createClient)(process.env['SUPABASE_URL'] || '', process.env['SUPABASE_SERVICE_ROLE_KEY'] || '', {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    // Get the standard client (for user operations)
    getClient() {
        return this.supabase;
    }
    // Get the admin client (for privileged operations)
    getAdminClient() {
        return this.supabaseAdmin;
    }
    // Test connection
    async testConnection() {
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
        }
        catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        }
    }
    // Health check
    async healthCheck() {
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
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            };
        }
    }
    // Get database info
    async getDatabaseInfo() {
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
        }
        catch (error) {
            return {
                version: 'PostgreSQL (Supabase)',
                connection: 'Connected via Supabase'
            };
        }
    }
}
exports.default = new SupabaseService();
//# sourceMappingURL=supabase.js.map