import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import publicRoutes from './public';
import gamesRoutes from './games';
import statsRoutes from './stats';
import teamsRoutes from './teams';
import videosRoutes from './videos';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/games', gamesRoutes);
router.use('/stats', statsRoutes);
router.use('/teams', teamsRoutes);
router.use('/videos', videosRoutes);

export default router;
