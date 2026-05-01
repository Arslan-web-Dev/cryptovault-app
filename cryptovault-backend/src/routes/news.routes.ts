import { Router, Request, Response } from 'express';
import newsService from '../services/news.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = (req.query['category'] as string) || 'all';
    const news = await newsService.getLatestNews(category);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router;
