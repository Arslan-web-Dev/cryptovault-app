"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomRateLimit = exports.apiRateLimit = exports.sensitiveRateLimit = exports.rateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = __importDefault(require("../config/redis"));
// General rate limiting
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || 'unknown';
    }
});
// Sensitive operations rate limiting (login, register, etc.)
exports.sensitiveRateLimit = (0, express_rate_limit_1.default)({
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
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: {
        error: 'API rate limit exceeded',
        message: 'Too many API requests. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = req.user;
        return user ? `user:${user.id}` : req.ip || 'unknown';
    }
});
// Custom Redis-based rate limiting for specific operations
const createCustomRateLimit = (key, limit, windowSeconds) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user ? `user:${req.user.id}:${key}` : `${req.ip}:${key}`;
            const result = await redis_1.default.checkRateLimit(identifier, limit, windowSeconds);
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
        }
        catch (error) {
            console.error('Rate limiting error:', error);
            next(); // Continue if rate limiting fails
        }
    };
};
exports.createCustomRateLimit = createCustomRateLimit;
//# sourceMappingURL=rateLimit.middleware.js.map