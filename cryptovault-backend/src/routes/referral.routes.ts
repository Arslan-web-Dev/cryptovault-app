import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import referralService from '../services/referral.service';

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

// All referral routes require authentication
router.use(authenticate);

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
router.get('/code',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const referralCode = await referralService.getReferralCode(req.user.id);
    if (!referralCode) {
      // Create one if it doesn't exist
      const newCode = await referralService.createReferralCode(req.user.id);
      return res.status(200).json(newCode);
    }
    res.status(200).json(referralCode);
  })
);

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
router.post('/code',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const referralCode = await referralService.createReferralCode(req.user.id);
    res.status(201).json(referralCode);
  })
);

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
router.post('/apply',
  apiRateLimit,
  [
    body('referralCode')
      .isLength({ min: 6, max: 10 })
      .withMessage('Referral code must be between 6 and 10 characters')
      .isAlphanumeric()
      .withMessage('Referral code must be alphanumeric')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const referral = await referralService.applyReferralCode(req.user.id, req.body.referralCode);
    res.status(201).json(referral);
  })
);

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
router.get('/validate/:code',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const validation = await referralService.validateReferralCode(req.params.code);
    res.status(200).json(validation);
  })
);

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
router.post('/complete',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    await referralService.completeReferral(req.user.id);
    res.status(200).json({ message: 'Referral completed successfully' });
  })
);

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
router.get('/referrals',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const referrals = await referralService.getUserReferrals(req.user.id);
    res.status(200).json(referrals);
  })
);

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
router.get('/stats',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const stats = await referralService.getReferralStats(req.user.id);
    res.status(200).json(stats);
  })
);

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
router.post('/track-trade',
  apiRateLimit,
  [
    body('tradeVolume')
      .isFloat({ min: 0 })
      .withMessage('Trade volume must be non-negative')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await referralService.trackTradeReferral(req.user.id, req.body.tradeVolume);
    res.status(200).json({ message: 'Trade tracked successfully' });
  })
);

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
router.post('/track-staking',
  apiRateLimit,
  [
    body('stakingRewards')
      .isFloat({ min: 0 })
      .withMessage('Staking rewards must be non-negative')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await referralService.trackStakingReferral(req.user.id, req.body.stakingRewards);
    res.status(200).json({ message: 'Staking tracked successfully' });
  })
);

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
router.post('/track-deposit',
  apiRateLimit,
  [
    body('depositAmount')
      .isFloat({ min: 0 })
      .withMessage('Deposit amount must be non-negative')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    await referralService.trackDepositReferral(req.user.id, req.body.depositAmount);
    res.status(200).json({ message: 'Deposit tracked successfully' });
  })
);

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
router.post('/pay-rewards',
  apiRateLimit,
  asyncHandler(async (req: any, res: any) => {
    const totalPaid = await referralService.payReferralRewards(req.user.id);
    res.status(200).json({ 
      message: 'Rewards paid successfully',
      totalPaid: totalPaid
    });
  })
);

export default router;
