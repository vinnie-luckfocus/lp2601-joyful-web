/**
 * Games Routes
 * Protected endpoints for game schedule
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyToken } from '../middleware/auth';
import { getGames, getGameById } from '../services/games';

const router = Router();

const gameIdSchema = z.string().regex(/^\d+$/, 'gameId must be a positive integer').transform((val) => parseInt(val, 10)).refine((val) => val > 0, 'gameId must be a positive integer');

/**
 * GET /api/games
 * Get all games with current user's attendance status
 */
router.get(
  '/',
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

      const games = await getGames(req.user.userId);

      res.json({
        success: true,
        data: games,
        error: null,
        meta: {
          count: games.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        meta: {},
      });
    }
  }
);

/**
 * GET /api/games/:id
 * Get single game details with current user's attendance status
 */
router.get(
  '/:id',
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

      const parseResult = gameIdSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const gameId = parseResult.data;
      const game = await getGameById(gameId, req.user.userId);

      if (!game) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Game not found',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: game,
        error: null,
        meta: {},
      });
    } catch (error) {
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
