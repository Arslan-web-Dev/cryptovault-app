import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import adminService from '../services/admin.service';

const router = Router();

// Validation middleware
const handleValidationErrors = (_req: any, res: any, next: any) => {
  const errors = validationResult(_req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

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
router.get('/dashboard',
  apiRateLimit,
  asyncHandler(async (_req: any, res: any) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(stats);
  })
);

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
router.get('/users',
  apiRateLimit,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Invalid role'),
    query('kycLevel').optional().isIn(['NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3']).withMessage('Invalid KYC level'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    query('sortBy').optional().isIn(['createdAt', 'lastLogin', 'balance', 'transactions']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const { page = 1, limit = 20, search, role, kycLevel, status, sortBy, sortOrder } = req.query;
    const result = await adminService.getUsers(
      parseInt(page as string),
      parseInt(limit as string),
      {
        search: search as string,
        role: role as any,
        kycLevel: kycLevel as string,
        status: status as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      }
    );
    res.status(200).json(result);
  })
);

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
router.get('/users/:userId',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const userDetails = await adminService.getUserDetails(req.params.userId);
    res.status(200).json(userDetails);
  })
);

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
router.put('/users/:userId/role',
  apiRateLimit,
  [
    body('role').isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Invalid role')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await adminService.updateUserRole(req.params.userId, req.body.role);
    res.status(200).json({ message: 'User role updated successfully' });
  })
);

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
router.put('/users/:userId/status',
  apiRateLimit,
  [
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await adminService.updateUserStatus(req.params.userId, req.body.isActive, req.body.reason);
    res.status(200).json({ message: 'User status updated successfully' });
  })
);

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
router.put('/users/:userId/kyc',
  apiRateLimit,
  [
    body('kycLevel').isIn(['NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3']).withMessage('Invalid KYC level')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await adminService.updateUserKycLevel(req.params.userId, req.body.kycLevel);
    res.status(200).json({ message: 'KYC level updated successfully' });
  })
);

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
router.post('/users/:userId/reset-password',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    await adminService.forcePasswordReset(req.params.userId);
    res.status(200).json({ message: 'Password reset forced successfully' });
  })
);

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
router.get('/alerts',
  apiRateLimit,
  asyncHandler(async (_req: any, res: any) => {
    const alerts = await adminService.getSystemAlerts();
    res.status(200).json(alerts);
  })
);

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
router.post('/alerts/:alertId/resolve',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    await adminService.resolveAlert(req.params.alertId, req.user.id);
    res.status(200).json({ message: 'Alert resolved successfully' });
  })
);

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
router.get('/transactions',
  apiRateLimit,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('amountMin').optional().isFloat({ min: 0 }).withMessage('Amount min must be non-negative'),
    query('amountMax').optional().isFloat({ min: 0 }).withMessage('Amount max must be non-negative'),
    query('riskScoreMin').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score must be between 0 and 100')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const { page = 1, limit = 50, status, amountMin, amountMax, riskScoreMin, dateFrom, dateTo } = req.query;
    const result = await adminService.getTransactionMonitoring(
      parseInt(page as string),
      parseInt(limit as string),
      {
        status: status as string,
        amountMin: amountMin ? parseFloat(amountMin as string) : undefined,
        amountMax: amountMax ? parseFloat(amountMax as string) : undefined,
        riskScoreMin: riskScoreMin ? parseInt(riskScoreMin as string) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      }
    );
    res.status(200).json(result);
  })
);

export default router;
