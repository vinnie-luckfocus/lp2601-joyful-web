/**
 * Stats Routes
 * Player statistics endpoints
 */

import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { getPlayerStats } from '../services/stats';

const router = Router();

/**
 * GET /api/stats/me
 * Get current player's statistics
 */
router.get(
  '/me',
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          data: null,
          error: 'Unauthorized',
          meta: {},
        });
        return;
      }

      const stats = await getPlayerStats(req.user.userId);

      if (!stats) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Player not found',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        meta: {},
      });
    }
  }
);

export default router;
