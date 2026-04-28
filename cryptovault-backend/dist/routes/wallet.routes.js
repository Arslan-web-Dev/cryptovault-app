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
const wallet_service_1 = __importDefault(require("../services/wallet.service"));
const router = (0, express_1.Router)();
// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
// All wallet routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user wallets
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallets retrieved successfully
 */
router.get('/', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.getUserWallets(req.user.id);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/create:
 *   post:
 *     summary: Create new wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coin_type
 *             properties:
 *               coin_type:
 *                 type: string
 *                 enum: [BTC, ETH, SOL, USDT]
 *               wallet_name:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Wallet created successfully
 */
router.post('/create', rateLimit_middleware_1.apiRateLimit, (0, auth_middleware_1.requireKycLevel)('LEVEL_1'), [
    (0, express_validator_1.body)('coin_type')
        .isIn(['BTC', 'ETH', 'SOL', 'USDT'])
        .withMessage('Invalid coin type'),
    (0, express_validator_1.body)('wallet_name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Wallet name must be between 1 and 100 characters')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.createWallet({
        coinType: req.body.coin_type,
        walletName: req.body.wallet_name,
        userId: req.user.id
    });
    res.status(201).json(result);
}));
/**
 * @swagger
 * /api/wallet/{id}/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 */
router.get('/:id/balance', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.getWalletBalance(req.params.id, req.user.id);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/{id}/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Wallet transactions retrieved successfully
 */
router.get('/:id/transactions', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await wallet_service_1.default.getWalletTransactions(req.params.id, req.user.id, page, limit);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/{id}/name:
 *   put:
 *     summary: Update wallet name
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet_name
 *             properties:
 *               wallet_name:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Wallet name updated successfully
 */
router.put('/:id/name', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('wallet_name')
        .isLength({ min: 1, max: 100 })
        .withMessage('Wallet name must be between 1 and 100 characters')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.updateWalletName(req.params.id, req.user.id, req.body.wallet_name);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/{id}/default:
 *   put:
 *     summary: Set wallet as default
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet set as default successfully
 */
router.put('/:id/default', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.setDefaultWallet(req.params.id, req.user.id);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/{id}:
 *   delete:
 *     summary: Delete wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 */
router.delete('/:id', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await wallet_service_1.default.deleteWallet(req.params.id, req.user.id);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/wallet/validate-address:
 *   post:
 *     summary: Validate cryptocurrency address
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - coin_type
 *             properties:
 *               address:
 *                 type: string
 *               coin_type:
 *                 type: string
 *                 enum: [BTC, ETH, SOL, USDT]
 *     responses:
 *       200:
 *         description: Address validation result
 */
router.post('/validate-address', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('address')
        .notEmpty()
        .withMessage('Address is required'),
    (0, express_validator_1.body)('coin_type')
        .isIn(['BTC', 'ETH', 'SOL', 'USDT'])
        .withMessage('Invalid coin type')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const isValid = await wallet_service_1.default.validateAddress(req.body.address, req.body.coin_type);
    res.status(200).json({ is_valid: isValid });
}));
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map