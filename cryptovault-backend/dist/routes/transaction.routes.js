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
const transaction_service_1 = __importDefault(require("../services/transaction.service"));
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
// All transaction routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: walletId
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
 *         description: Transactions retrieved successfully
 */
router.get('/', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('walletId').optional().isUUID().withMessage('Invalid wallet ID'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { walletId, page = 1, limit = 10 } = req.query;
    const result = await transaction_service_1.default.getTransactionHistory(req.user.id, walletId, parseInt(page), parseInt(limit));
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/transactions/send:
 *   post:
 *     summary: Send cryptocurrency
 *     tags: [Transactions]
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
 *               - toAddress
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *               toAddress:
 *                 type: string
 *               amount:
 *                 type: string
 *               feeLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *               twoFactorCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/send', rateLimit_middleware_1.apiRateLimit, (0, auth_middleware_1.requireKycLevel)('LEVEL_1'), [
    (0, express_validator_1.body)('walletId').isUUID().withMessage('Invalid wallet ID'),
    (0, express_validator_1.body)('toAddress').notEmpty().withMessage('Recipient address is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('feeLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid fee level'),
    (0, express_validator_1.body)('twoFactorCode').optional().isString().withMessage('Invalid 2FA code')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.default.sendTransaction(req.user.id, req.body);
    res.status(201).json(result);
}));
/**
 * @swagger
 * /api/transactions/receive:
 *   post:
 *     summary: Get receive address and QR code
 *     tags: [Transactions]
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
 *             properties:
 *               walletId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receive information retrieved successfully
 */
router.post('/receive', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('walletId').isUUID().withMessage('Invalid wallet ID')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.default.receiveTransaction(req.user.id, req.body.walletId);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/transactions/swap:
 *   post:
 *     summary: Swap between cryptocurrencies
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromWalletId
 *               - toWalletId
 *               - amount
 *             properties:
 *               fromWalletId:
 *                 type: string
 *               toWalletId:
 *                 type: string
 *               amount:
 *                 type: string
 *               slippage:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 50
 *     responses:
 *       201:
 *         description: Swap transaction created successfully
 */
router.post('/swap', rateLimit_middleware_1.apiRateLimit, (0, auth_middleware_1.requireKycLevel)('LEVEL_1'), [
    (0, express_validator_1.body)('fromWalletId').isUUID().withMessage('Invalid source wallet ID'),
    (0, express_validator_1.body)('toWalletId').isUUID().withMessage('Invalid target wallet ID'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('slippage').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Slippage must be between 0.1% and 50%')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.default.swapTransaction(req.user.id, req.body);
    res.status(201).json(result);
}));
/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
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
 *         description: Transaction details retrieved successfully
 */
router.get('/:id', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.default.getTransactionDetails(req.user.id, req.params.id);
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/transactions/{id}/status:
 *   put:
 *     summary: Update transaction status
 *     tags: [Transactions]
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
 *         description: Transaction status updated successfully
 */
router.put('/:id/status', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await transaction_service_1.default.updateTransactionStatus(req.params.id);
    res.status(200).json({ message: 'Transaction status updated' });
}));
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map