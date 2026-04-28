"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class RedisService {
    constructor() {
        this.client = new ioredis_1.default({
            host: process.env['REDIS_HOST'] || 'localhost',
            port: parseInt(process.env['REDIS_PORT'] || '6379'),
            password: process.env['REDIS_PASSWORD'],
            retryStrategy: (times) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        this.client.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            console.error('❌ Redis connection failed:', error);
            throw error;
        }
    }
    // Session Management
    async setSession(sessionId, userId, ttl = 86400) {
        return this.client.setex(`session:${sessionId}`, ttl, userId);
    }
    async getSession(sessionId) {
        return this.client.get(`session:${sessionId}`);
    }
    async deleteSession(sessionId) {
        return this.client.del(`session:${sessionId}`);
    }
    // Market Data Caching
    async cacheMarketPrices(prices, ttl = 300) {
        return this.client.setex('market:prices', ttl, JSON.stringify(prices));
    }
    async getMarketPrices() {
        const data = await this.client.get('market:prices');
        return data ? JSON.parse(data) : null;
    }
    // Generic Redis methods
    async get(key) {
        return this.client.get(key);
    }
    async setex(key, ttl, value) {
        return this.client.setex(key, ttl, value);
    }
    // Rate Limiting
    async checkRateLimit(key, limit, windowSeconds) {
        const current = await this.client.incr(key);
        if (current === 1) {
            await this.client.expire(key, windowSeconds);
        }
        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            resetTime: windowSeconds
        };
    }
    // User Balance Cache
    async cacheBalance(userId, coinType, balance, ttl = 60) {
        return this.client.setex(`balance:${userId}:${coinType}`, ttl, JSON.stringify(balance));
    }
    async getCachedBalance(userId, coinType) {
        const data = await this.client.get(`balance:${userId}:${coinType}`);
        return data ? JSON.parse(data) : null;
    }
    // WebSocket Presence
    async setUserOnline(userId, socketId) {
        await this.client.sadd(`user:sockets:${userId}`, socketId);
        await this.client.set(`socket:user:${socketId}`, userId);
    }
    async setUserOffline(userId, socketId) {
        await this.client.srem(`user:sockets:${userId}`, socketId);
        await this.client.del(`socket:user:${socketId}`);
    }
    async isUserOnline(userId) {
        const count = await this.client.scard(`user:sockets:${userId}`);
        return count > 0;
    }
    // Close connection
    async disconnect() {
        await this.client.quit();
    }
}
exports.default = new RedisService();
//# sourceMappingURL=redis.js.map