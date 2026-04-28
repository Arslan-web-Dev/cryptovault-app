import rateLimit from 'express-rate-limit';
import redisService from '../config/redis';

// General rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Sensitive operations rate limiting (login, register, etc.)
export const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    error: 'Too many attempts',
    message: 'Too many sensitive operations attempted. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// API rate limiting for authenticated users
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: {
    error: 'API rate limit exceeded',
    message: 'Too many API requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Custom Redis-based rate limiting for specific operations
export const createCustomRateLimit = (key: string, limit: number, windowSeconds: number) => {
  return async (req: any, res: any, next: any) => {
    try {
      const identifier = req.user ? `user:${req.user.id}:${key}` : `${req.ip}:${key}`;
      const result = await redisService.checkRateLimit(identifier, limit, windowSeconds);
      
      if (!result.allowed) {
        res.set('X-RateLimit-Limit', limit.toString());
        res.set('X-RateLimit-Remaining', result.remaining.toString());
        res.set('X-RateLimit-Reset', result.resetTime.toString());
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Maximum ${limit} requests per ${windowSeconds} seconds.`,
          retryAfter: result.resetTime
        });
      }
      
      res.set('X-RateLimit-Limit', limit.toString());
      res.set('X-RateLimit-Remaining', result.remaining.toString());
      res.set('X-RateLimit-Reset', result.resetTime.toString());
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue if rate limiting fails
    }
  };
};
