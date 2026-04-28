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
const admin_service_1 = __importDefault(require("../services/admin.service"));
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
// All admin routes require authentication and admin role
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)('ADMIN'));
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/dashboard', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const stats = await admin_service_1.default.getDashboardStats();
    res.status(200).json(stats);
}));
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filtering and pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, SUPPORT]
 *       - in: query
 *         name: kycLevel
 *         schema:
 *           type: string
 *           enum: [NONE, LEVEL_1, LEVEL_2, LEVEL_3]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, lastLogin, balance, transactions]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('role').optional().isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Invalid role'),
    (0, express_validator_1.query)('kycLevel').optional().isIn(['NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3']).withMessage('Invalid KYC level'),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    (0, express_validator_1.query)('sortBy').optional().isIn(['createdAt', 'lastLogin', 'balance', 'transactions']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, search, role, kycLevel, status, sortBy, sortOrder } = req.query;
    const result = await admin_service_1.default.getUsers(parseInt(page), parseInt(limit), {
        search: search,
        role: role,
        kycLevel: kycLevel,
        status: status,
        sortBy: sortBy,
        sortOrder: sortOrder
    });
    res.status(200).json(result);
}));
/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get detailed user information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/users/:userId', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userDetails = await admin_service_1.default.getUserDetails(req.params.userId);
    res.status(200).json(userDetails);
}));
/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, SUPPORT]
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
router.put('/users/:userId/role', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('role').isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Invalid role')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await admin_service_1.default.updateUserRole(req.params.userId, req.body.role);
    res.status(200).json({ message: 'User role updated successfully' });
}));
/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Update user status (activate/deactivate)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put('/users/:userId/status', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('isActive').isBoolean().withMessage('isActive must be a boolean'),
    (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await admin_service_1.default.updateUserStatus(req.params.userId, req.body.isActive, req.body.reason);
    res.status(200).json({ message: 'User status updated successfully' });
}));
/**
 * @swagger
 * /api/admin/users/{userId}/kyc:
 *   put:
 *     summary: Update user KYC level
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kycLevel
 *             properties:
 *               kycLevel:
 *                 type: string
 *                 enum: [NONE, LEVEL_1, LEVEL_2, LEVEL_3]
 *     responses:
 *       200:
 *         description: KYC level updated successfully
 */
router.put('/users/:userId/kyc', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.body)('kycLevel').isIn(['NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3']).withMessage('Invalid KYC level')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await admin_service_1.default.updateUserKycLevel(req.params.userId, req.body.kycLevel);
    res.status(200).json({ message: 'KYC level updated successfully' });
}));
/**
 * @swagger
 * /api/admin/users/{userId}/reset-password:
 *   post:
 *     summary: Force password reset for user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset forced successfully
 */
router.post('/users/:userId/reset-password', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await admin_service_1.default.forcePasswordReset(req.params.userId);
    res.status(200).json({ message: 'Password reset forced successfully' });
}));
/**
 * @swagger
 * /api/admin/alerts:
 *   get:
 *     summary: Get system alerts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System alerts retrieved successfully
 */
router.get('/alerts', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const alerts = await admin_service_1.default.getSystemAlerts();
    res.status(200).json(alerts);
}));
/**
 * @swagger
 * /api/admin/alerts/{alertId}/resolve:
 *   post:
 *     summary: Resolve system alert
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.post('/alerts/:alertId/resolve', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await admin_service_1.default.resolveAlert(req.params.alertId, req.user.id);
    res.status(200).json({ message: 'Alert resolved successfully' });
}));
/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get transaction monitoring data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: amountMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: amountMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: riskScoreMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transaction monitoring data retrieved successfully
 */
router.get('/transactions', rateLimit_middleware_1.apiRateLimit, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('amountMin').optional().isFloat({ min: 0 }).withMessage('Amount min must be non-negative'),
    (0, express_validator_1.query)('amountMax').optional().isFloat({ min: 0 }).withMessage('Amount max must be non-negative'),
    (0, express_validator_1.query)('riskScoreMin').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score must be between 0 and 100')
], handleValidationErrors, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 50, status, amountMin, amountMax, riskScoreMin, dateFrom, dateTo } = req.query;
    const result = await admin_service_1.default.getTransactionMonitoring(parseInt(page), parseInt(limit), {
        status: status,
        amountMin: amountMin ? parseFloat(amountMin) : undefined,
        amountMax: amountMax ? parseFloat(amountMax) : undefined,
        riskScoreMin: riskScoreMin ? parseInt(riskScoreMin) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
    });
    res.status(200).json(result);
}));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map