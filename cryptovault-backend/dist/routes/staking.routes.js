"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const staking_service_1 = __importDefault(require("../services/staking.service"));
const router = (0, express_1.Router)();
// Validation middleware
const handleValidationErrors = (_req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(_req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
// All staking routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/staking/pools:
 *   get:
 *     summary: Get available staking pools
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staking pools retrieved successfully
 */
router.get('/pools', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const pools = await staking_service_1.default.getStakingPools();
    res.status(200).json(pools);
}));
/**
 * @swagger
 * /api/staking/pool/{coinType}:
 *   get:
 *     summary: Get staking pool for specific coin
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coinType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BTC, ETH, SOL, USDT]
 *     responses:
 *       200:
 *         description: Staking pool retrieved successfully
 */
router.get('/pool/:coinType', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pool = await staking_service_1.default.getStakingPool(req.params.coinType);
    if (!pool) {
        return res.status(404).json({ error: 'Staking pool not found' });
    }
    res.status(200).json(pool);
}));
/**
 * @swagger
 * /api/staking/positions:
 *   get:
 *     summary: Get user staking positions
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staking positions retrieved successfully
 */
router.get('/positions', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const positions = await staking_service_1.default.getUserStakingPositions(req.user.id);
    res.status(200).json(positions);
}));
/**
 * @swagger
 * /api/staking/positions:
 *   post:
 *     summary: Create new staking position
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - amount
 *               - lockPeriod
 *             properties:
 *               walletId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.00000001
 *               lockPeriod:
 *                 type: integer
 *                 enum: [30, 90, 180, 365]
 *     responses:
 *       201:
 *         description: Staking position created successfully
 */
router.post('/positions', rateLimit_middleware_1.apiRateLimit, (0, auth_middleware_1.requireKycLevel)('LEVEL_1'), [
    (0, express_validator_1.body)('walletId').isUUID().withMessage('Invalid wallet ID'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('lockPeriod').isIn([30, 90, 180, 365]).withMessage('Invalid lock period')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const position = await staking_service_1.default.createStakingPosition(req.user.id, req.body.walletId, req.body.amount, req.body.lockPeriod);
    res.status(201).json(position);
}));
/**
 * @swagger
 * /api/staking/positions/{positionId}:
 *   get:
 *     summary: Get specific staking position
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staking position retrieved successfully
 */
router.get('/positions/:positionId', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const position = await staking_service_1.default.getStakingPosition(req.user.id, req.params.positionId);
    if (!position) {
        return res.status(404).json({ error: 'Staking position not found' });
    }
    res.status(200).json(position);
}));
/**
 * @swagger
 * /api/staking/positions/{positionId}/withdraw:
 *   post:
 *     summary: Withdraw staking position
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staking position withdrawn successfully
 */
router.post('/positions/:positionId/withdraw', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await staking_service_1.default.withdrawStakingPosition(req.user.id, req.params.positionId);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/staking/positions/{positionId}/rewards:
 *   get:
 *     summary: Get calculated rewards for staking position
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rewards calculated successfully
 */
router.get('/positions/:positionId/rewards', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const rewards = await staking_service_1.default.calculateRewards(req.params.positionId);
    res.status(200).json({ rewards });
}));
/**
 * @swagger
 * /api/staking/summary:
 *   get:
 *     summary: Get user staking summary
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staking summary retrieved successfully
 */
router.get('/summary', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const summary = await staking_service_1.default.getStakingSummary(req.user.id);
    res.status(200).json(summary);
}));
exports.default = router;
//# sourceMappingURL=staking.routes.js.map