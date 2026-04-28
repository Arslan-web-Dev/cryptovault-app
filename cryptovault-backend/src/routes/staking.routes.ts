import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, requireKycLevel } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import stakingService from '../services/staking.service';

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

// All staking routes require authentication
router.use(authenticate);

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
router.get('/pools',
  apiRateLimit,
  asyncHandler(async (_req: any, res: any) => {
    const pools = await stakingService.getStakingPools();
    res.status(200).json(pools);
  })
);

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
router.get('/pool/:coinType',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const pool = await stakingService.getStakingPool(req.params.coinType);
    if (!pool) {
      return res.status(404).json({ error: 'Staking pool not found' });
    }
    res.status(200).json(pool);
  })
);

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
router.get('/positions',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const positions = await stakingService.getUserStakingPositions(req.user.id);
    res.status(200).json(positions);
  })
);

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
router.post('/positions',
  apiRateLimit,
  requireKycLevel('LEVEL_1'),
  [
    body('walletId').isUUID().withMessage('Invalid wallet ID'),
    body('amount').isFloat({ min: 0.00000001 }).withMessage('Amount must be greater than 0'),
    body('lockPeriod').isIn([30, 90, 180, 365]).withMessage('Invalid lock period')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const position = await stakingService.createStakingPosition(
      req.user.id,
      req.body.walletId,
      req.body.amount,
      req.body.lockPeriod
    );
    res.status(201).json(position);
  })
);

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
router.get('/positions/:positionId',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const position = await stakingService.getStakingPosition(req.user.id, req.params.positionId);
    if (!position) {
      return res.status(404).json({ error: 'Staking position not found' });
    }
    res.status(200).json(position);
  })
);

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
router.post('/positions/:positionId/withdraw',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const result = await stakingService.withdrawStakingPosition(req.user.id, req.params.positionId);
    res.status(200).json(result);
  })
);

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
router.get('/positions/:positionId/rewards',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const rewards = await stakingService.calculateRewards(req.params.positionId);
    res.status(200).json({ rewards });
  })
);

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
router.get('/summary',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const summary = await stakingService.getStakingSummary(req.user.id);
    res.status(200).json(summary);
  })
);

export default router;
