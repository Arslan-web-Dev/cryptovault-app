import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ total_value: 0, total_pnl: 0, pnl_percentage: 0 });
}));

router.get('/allocation', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ allocation: [] });
}));

router.get('/performance', apiRateLimit, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ performance: [] });
}));

export default router;
