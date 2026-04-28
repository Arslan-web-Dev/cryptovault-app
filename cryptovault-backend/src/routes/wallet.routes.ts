import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireKycLevel } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import walletService from '../services/wallet.service';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// All wallet routes require authentication
router.use(authenticate);

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
router.get('/',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.getUserWallets(req.user.id);
    res.status(200).json(result);
  })
);

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
router.post('/create',
  apiRateLimit,
  requireKycLevel('LEVEL_1'),
  [
    body('coin_type')
      .isIn(['BTC', 'ETH', 'SOL', 'USDT'])
      .withMessage('Invalid coin type'),
    body('wallet_name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Wallet name must be between 1 and 100 characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.createWallet({
      coinType: req.body.coin_type,
      walletName: req.body.wallet_name,
      userId: req.user.id
    });
    res.status(201).json(result);
  })
);

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
router.get('/:id/balance',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.getWalletBalance(req.params.id, req.user.id);
    res.status(200).json(result);
  })
);

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
router.get('/:id/transactions',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await walletService.getWalletTransactions(req.params.id, req.user.id, page, limit);
    res.status(200).json(result);
  })
);

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
router.put('/:id/name',
  apiRateLimit,
  [
    body('wallet_name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Wallet name must be between 1 and 100 characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.updateWalletName(req.params.id, req.user.id, req.body.wallet_name);
    res.status(200).json(result);
  })
);

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
router.put('/:id/default',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.setDefaultWallet(req.params.id, req.user.id);
    res.status(200).json(result);
  })
);

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
router.delete('/:id',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await walletService.deleteWallet(req.params.id, req.user.id);
    res.status(200).json(result);
  })
);

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
router.post('/validate-address',
  apiRateLimit,
  [
    body('address')
      .notEmpty()
      .withMessage('Address is required'),
    body('coin_type')
      .isIn(['BTC', 'ETH', 'SOL', 'USDT'])
      .withMessage('Invalid coin type')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const isValid = await walletService.validateAddress(req.body.address, req.body.coin_type);
    res.status(200).json({ is_valid: isValid });
  })
);

export default router;
