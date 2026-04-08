import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
