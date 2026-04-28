"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const express_validator_2 = require("express-validator");
const market_service_1 = __importDefault(require("../services/market.service"));
const router = (0, express_1.Router)();
// Validation middleware
const handleValidationErrors = (_req, res, next) => {
    const errors = (0, express_validator_2.validationResult)(_req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
/**
 * @swagger
 * /api/market/prices:
 *   get:
 *     summary: Get current cryptocurrency prices
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Current prices retrieved successfully
 */
router.get('/prices', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const prices = await market_service_1.default.getCurrentPrices();
    res.status(200).json(prices);
}));
/**
 * @swagger
 * /api/market/coin/{coinId}:
 *   get:
 *     summary: Get detailed coin information
 *     tags: [Market]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coin details retrieved successfully
 */
router.get('/coin/:coinId', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const coinDetails = await market_service_1.default.getCoinDetails(req.params.coinId);
    res.status(200).json(coinDetails);
}));
/**
 * @swagger
 * /api/market/chart/{coinId}:
 *   get:
 *     summary: Get historical price chart data
 *     tags: [Market]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           enum: [1, 7, 14, 30, 90, 180, 365]
 *     responses:
 *       200:
 *         description: Historical price data retrieved successfully
 */
router.get('/chart/:coinId', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be between 1 and 365')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const chartData = await market_service_1.default.getHistoricalPrices(req.params.coinId, days);
    res.status(200).json({
        coin: req.params.coinId,
        days: days,
        prices: chartData
    });
}));
/**
 * @swagger
 * /api/market/global:
 *   get:
 *     summary: Get global market overview
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Global market data retrieved successfully
 */
router.get('/global', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const marketOverview = await market_service_1.default.getMarketOverview();
    res.status(200).json(marketOverview);
}));
/**
 * @swagger
 * /api/market/top:
 *   get:
 *     summary: Get top cryptocurrencies by market cap
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 250
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Top cryptocurrencies retrieved successfully
 */
router.get('/top', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 250 })
        .withMessage('Limit must be between 1 and 250'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be at least 1')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const topCoins = await market_service_1.default.getTopCoins(limit, page);
    res.status(200).json({
        coins: topCoins,
        pagination: {
            page,
            limit,
            total: 10000 // Approximate total, would need to get actual count
        }
    });
}));
/**
 * @swagger
 * /api/market/search:
 *   get:
 *     summary: Search cryptocurrencies
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('q')
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const searchResults = await market_service_1.default.searchCoins(req.query.q);
    res.status(200).json({
        query: req.query.q,
        results: searchResults
    });
}));
/**
 * @swagger
 * /api/market/trending:
 *   get:
 *     summary: Get trending cryptocurrencies
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Trending cryptocurrencies retrieved successfully
 */
router.get('/trending', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const trendingCoins = await market_service_1.default.getTrendingCoins();
    res.status(200).json({
        trending: trendingCoins
    });
}));
/**
 * @swagger
 * /api/market/supported:
 *   get:
 *     summary: Get list of supported cryptocurrencies
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Supported cryptocurrencies retrieved successfully
 */
router.get('/supported', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const supportedCoins = market_service_1.default.getSupportedCoins();
    res.status(200).json({
        supported_coins: supportedCoins
    });
}));
exports.default = router;
//# sourceMappingURL=market.routes.js.map