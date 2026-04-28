import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, requireKycLevel } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import transactionService from '../services/transaction.service';

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

// All transaction routes require authentication
router.use(authenticate);

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
router.get('/',
  apiRateLimit,
  [
    query('walletId').optional().isUUID().withMessage('Invalid wallet ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const { walletId, page = 1, limit = 10 } = req.query;
    const result = await transactionService.getTransactionHistory(
      req.user.id,
      walletId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.status(200).json(result);
  })
);

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
router.post('/send',
  apiRateLimit,
  requireKycLevel('LEVEL_1'),
  [
    body('walletId').isUUID().withMessage('Invalid wallet ID'),
    body('toAddress').notEmpty().withMessage('Recipient address is required'),
    body('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    body('feeLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid fee level'),
    body('twoFactorCode').optional().isString().withMessage('Invalid 2FA code')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await transactionService.sendTransaction(req.user.id, req.body);
    res.status(201).json(result);
  })
);

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
router.post('/receive',
  apiRateLimit,
  [
    body('walletId').isUUID().withMessage('Invalid wallet ID')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await transactionService.receiveTransaction(req.user.id, req.body.walletId);
    res.status(200).json(result);
  })
);

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
router.post('/swap',
  apiRateLimit,
  requireKycLevel('LEVEL_1'),
  [
    body('fromWalletId').isUUID().withMessage('Invalid source wallet ID'),
    body('toWalletId').isUUID().withMessage('Invalid target wallet ID'),
    body('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    body('slippage').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Slippage must be between 0.1% and 50%')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await transactionService.swapTransaction(req.user.id, req.body);
    res.status(201).json(result);
  })
);

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
router.get('/:id',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await transactionService.getTransactionDetails(req.user.id, req.params.id);
    res.status(200).json(result);
  })
);

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
router.put('/:id/status',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    await transactionService.updateTransactionStatus(req.params.id);
    res.status(200).json({ message: 'Transaction status updated' });
  })
);

export default router;
