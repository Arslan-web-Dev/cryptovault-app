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
const referral_service_1 = __importDefault(require("../services/referral.service"));
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
// All referral routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/referral/code:
 *   get:
 *     summary: Get user referral code
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code retrieved successfully
 */
router.get('/code', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const referralCode = await referral_service_1.default.getReferralCode(req.user.id);
    if (!referralCode) {
        // Create one if it doesn't exist
        const newCode = await referral_service_1.default.createReferralCode(req.user.id);
        return res.status(200).json(newCode);
    }
    res.status(200).json(referralCode);
}));
/**
 * @swagger
 * /api/referral/code:
 *   post:
 *     summary: Create new referral code
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Referral code created successfully
 */
router.post('/code', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const referralCode = await referral_service_1.default.createReferralCode(req.user.id);
    res.status(201).json(referralCode);
}));
/**
 * @swagger
 * /api/referral/apply:
 *   post:
 *     summary: Apply referral code during signup
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralCode
 *             properties:
 *               referralCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 10
 *     responses:
 *       201:
 *         description: Referral code applied successfully
 */
router.post('/apply', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('referralCode')
        .isLength({ min: 6, max: 10 })
        .withMessage('Referral code must be between 6 and 10 characters')
        .isAlphanumeric()
        .withMessage('Referral code must be alphanumeric')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const referral = await referral_service_1.default.applyReferralCode(req.user.id, req.body.referralCode);
    res.status(201).json(referral);
}));
/**
 * @swagger
 * /api/referral/validate/{code}:
 *   get:
 *     summary: Validate referral code
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referral code validation result
 */
router.get('/validate/:code', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const validation = await referral_service_1.default.validateReferralCode(req.params.code);
    res.status(200).json(validation);
}));
/**
 * @swagger
 * /api/referral/complete:
 *   post:
 *     summary: Complete referral (after user completes KYC)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral completed successfully
 */
router.post('/complete', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await referral_service_1.default.completeReferral(req.user.id);
    res.status(200).json({ message: 'Referral completed successfully' });
}));
/**
 * @swagger
 * /api/referral/referrals:
 *   get:
 *     summary: Get user referrals and rewards
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User referrals retrieved successfully
 */
router.get('/referrals', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const referrals = await referral_service_1.default.getUserReferrals(req.user.id);
    res.status(200).json(referrals);
}));
/**
 * @swagger
 * /api/referral/stats:
 *   get:
 *     summary: Get user referral statistics
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral statistics retrieved successfully
 */
router.get('/stats', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const stats = await referral_service_1.default.getReferralStats(req.user.id);
    res.status(200).json(stats);
}));
/**
 * @swagger
 * /api/referral/track-trade:
 *   post:
 *     summary: Track trade for referral rewards
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tradeVolume
 *             properties:
 *               tradeVolume:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Trade tracked successfully
 */
router.post('/track-trade', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('tradeVolume')
        .isFloat({ min: 0 })
        .withMessage('Trade volume must be non-negative')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await referral_service_1.default.trackTradeReferral(req.user.id, req.body.tradeVolume);
    res.status(200).json({ message: 'Trade tracked successfully' });
}));
/**
 * @swagger
 * /api/referral/track-staking:
 *   post:
 *     summary: Track staking for referral rewards
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stakingRewards
 *             properties:
 *               stakingRewards:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Staking tracked successfully
 */
router.post('/track-staking', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('stakingRewards')
        .isFloat({ min: 0 })
        .withMessage('Staking rewards must be non-negative')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await referral_service_1.default.trackStakingReferral(req.user.id, req.body.stakingRewards);
    res.status(200).json({ message: 'Staking tracked successfully' });
}));
/**
 * @swagger
 * /api/referral/track-deposit:
 *   post:
 *     summary: Track deposit for referral rewards
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - depositAmount
 *             properties:
 *               depositAmount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Deposit tracked successfully
 */
router.post('/track-deposit', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('depositAmount')
        .isFloat({ min: 0 })
        .withMessage('Deposit amount must be non-negative')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await referral_service_1.default.trackDepositReferral(req.user.id, req.body.depositAmount);
    res.status(200).json({ message: 'Deposit tracked successfully' });
}));
/**
 * @swagger
 * /api/referral/pay-rewards:
 *   post:
 *     summary: Pay pending referral rewards
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rewards paid successfully
 */
router.post('/pay-rewards', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const totalPaid = await referral_service_1.default.payReferralRewards(req.user.id);
    res.status(200).json({
        message: 'Rewards paid successfully',
        totalPaid: totalPaid
    });
}));
exports.default = router;
//# sourceMappingURL=referral.routes.js.map