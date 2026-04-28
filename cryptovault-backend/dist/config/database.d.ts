import { PrismaClient } from '@prisma/client';
import supabaseService from './supabase';
declare const prisma: PrismaClient<{
    log: ("error" | "info" | "query" | "warn")[];
    datasources: {
        db: {
            url: string | undefined;
        };
    };
}, "error" | "info" | "query" | "warn", import("@prisma/client/runtime/client").DefaultArgs>;
export { prisma };
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export declare const checkDBHealth: () => Promise<boolean>;
export { supabaseService };
//# sourceMappingURL=database.d.ts.map