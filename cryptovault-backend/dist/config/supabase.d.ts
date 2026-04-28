import { SupabaseClient } from '@supabase/supabase-js';
declare class SupabaseService {
    private supabase;
    private supabaseAdmin;
    constructor();
    getClient(): SupabaseClient;
    getAdminClient(): SupabaseClient;
    testConnection(): Promise<boolean>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
    getDatabaseInfo(): Promise<{
        version: string;
        connection: string;
    }>;
}
declare const _default: SupabaseService;
export default _default;
//# sourceMappingURL=supabase.d.ts.map