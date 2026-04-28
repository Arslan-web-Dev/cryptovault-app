import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ message: 'User profile not implemented yet' });
}));

router.put('/profile', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ message: 'Profile update not implemented yet' });
}));

router.put('/change-password', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ message: 'Password change not implemented yet' });
}));

export default router;
