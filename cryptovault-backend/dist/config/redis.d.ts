import Redis from 'ioredis';
declare class RedisService {
    client: Redis;
    constructor();
    connect(): Promise<void>;
    setSession(sessionId: string, userId: string, ttl?: number): Promise<string>;
    getSession(sessionId: string): Promise<string | null>;
    deleteSession(sessionId: string): Promise<number>;
    cacheMarketPrices(prices: any, ttl?: number): Promise<string>;
    getMarketPrices(): Promise<any | null>;
    get(key: string): Promise<string | null>;
    setex(key: string, ttl: number, value: string): Promise<string>;
    checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: number;
    }>;
    cacheBalance(userId: string, coinType: string, balance: any, ttl?: number): Promise<string>;
    getCachedBalance(userId: string, coinType: string): Promise<any | null>;
    setUserOnline(userId: string, socketId: string): Promise<void>;
    setUserOffline(userId: string, socketId: string): Promise<void>;
    isUserOnline(userId: string): Promise<boolean>;
    disconnect(): Promise<void>;
}
declare const _default: RedisService;
export default _default;
//# sourceMappingURL=redis.d.ts.map