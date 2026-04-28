import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    log: ("error" | "info" | "query" | "warn")[];
}, "error" | "info" | "query" | "warn", import("@prisma/client/runtime/client").DefaultArgs>;
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=app.d.ts.map