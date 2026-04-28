import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { sensitiveRateLimit, createCustomRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: User already exists
 */
router.post('/register',
  sensitiveRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Full name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Valid phone number is required'),
    body('country')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Country must be a 2-letter code')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  sensitiveRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh',
  createCustomRateLimit('refresh', 10, 60), // 10 refresh attempts per minute
  [
    body('refresh_token')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.refresh(req.body.refresh_token);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout',
  authenticate,
  [
    body('refresh_token')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.logout(req.body.refresh_token);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *       401:
 *         description: Authentication required
 */
router.post('/2fa/setup',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.generate2FASecret(req.user!.id);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Verify and enable 2FA
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid verification code
 */
router.post('/2fa/verify',
  authenticate,
  [
    body('token')
      .matches(/^\d{6}$/)
      .withMessage('Token must be a 6-digit number')
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: any) => {
    const result = await authService.verify2FA(req.user!.id, req.body.token);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password',
  sensitiveRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
  ],
  handleValidationErrors,
  asyncHandler(async (_req: any, res: any) => {
    // TODO: Implement forgot password functionality
    res.status(200).json({ 
      message: 'If an account with this email exists, a password reset link has been sent.' 
    });
  })
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password',
  sensitiveRateLimit,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  asyncHandler(async (_req: any, res: any) => {
    // TODO: Implement reset password functionality
    res.status(200).json({ message: 'Password reset successful' });
  })
);

export default router;
