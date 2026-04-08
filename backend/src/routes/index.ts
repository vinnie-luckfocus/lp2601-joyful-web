import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
