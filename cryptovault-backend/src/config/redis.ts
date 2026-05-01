import Redis from 'ioredis';

class RedisService {
  client: Redis;

  constructor() {
    this.client = new Redis({
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

    this.client.on('ready', () => {
      console.log('✅ Redis ready');
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.client.status || this.client.status === 'end') {
        await this.client.connect();
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  // Session Management
  async setSession(sessionId: string, userId: string, ttl: number = 86400): Promise<string> {
    return this.client.setex(`session:${sessionId}`, ttl, userId);
  }

  async getSession(sessionId: string): Promise<string | null> {
    return this.client.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<number> {
    return this.client.del(`session:${sessionId}`);
  }

  // Market Data Caching
  async cacheMarketPrices(prices: any, ttl: number = 300): Promise<string> {
    return this.client.setex('market:prices', ttl, JSON.stringify(prices));
  }

  async getMarketPrices(): Promise<any | null> {
    const data = await this.client.get('market:prices');
    return data ? JSON.parse(data) : null;
  }

  // Generic Redis methods
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setex(key: string, ttl: number, value: string): Promise<string> {
    return this.client.setex(key, ttl, value);
  }

  // Rate Limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
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
  async cacheBalance(userId: string, coinType: string, balance: any, ttl: number = 60): Promise<string> {
    return this.client.setex(
      `balance:${userId}:${coinType}`,
      ttl,
      JSON.stringify(balance)
    );
  }

  async getCachedBalance(userId: string, coinType: string): Promise<any | null> {
    const data = await this.client.get(`balance:${userId}:${coinType}`);
    return data ? JSON.parse(data) : null;
  }

  // WebSocket Presence
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.client.sadd(`user:sockets:${userId}`, socketId);
    await this.client.set(`socket:user:${socketId}`, userId);
  }

  async setUserOffline(userId: string, socketId: string): Promise<void> {
    await this.client.srem(`user:sockets:${userId}`, socketId);
    await this.client.del(`socket:user:${socketId}`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const count = await this.client.scard(`user:sockets:${userId}`);
    return count > 0;
  }

  // Close connection
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export default new RedisService();
