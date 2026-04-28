export declare const rateLimitMiddleware: import("express-rate-limit").RateLimitRequestHandler;
export declare const sensitiveRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const createCustomRateLimit: (key: string, limit: number, windowSeconds: number) => (req: any, res: any, next: any) => Promise<any>;
//# sourceMappingURL=rateLimit.middleware.d.ts.map