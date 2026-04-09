/**
 * Public API Routes
 * Public endpoints for homepage dashboard
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getAllGames,
  getStandings,
  getLeaders,
  getRecentGameResults,
  PublicApiError,
} from '../services/publicApi';

const router = Router();

// Cache duration in seconds (5 minutes)
const CACHE_MAX_AGE = 300;

// Games endpoint cache duration in seconds (1 minute)
const GAMES_CACHE_MAX_AGE = 60;

// Validation schemas
const limitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : undefined))
  .refine((val) => val === undefined || (val > 0 && val <= 50), {
    message: 'limit must be between 1 and 50',
  });

const categorySchema = z.enum([
  'batting_average',
  'home_runs',
  'rbis',
  'hits',
  'runs',
  'doubles',
  'triples',
  'walks',
]);

/**
 * Set cache headers
 */
function setCacheHeaders(res: Response, maxAge: number = CACHE_MAX_AGE): void {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
}

/**
 * Handle errors uniformly
 */
function handleError(res: Response, error: unknown): void {
  if (error instanceof PublicApiError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // Unexpected errors
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({
    error: {
      code: '5000',
      message: '服务器内部错误',
      details: { originalError: message },
    },
  });
}

/**
 * GET /api/public/games
 * Get all season games (full schedule)
 */
router.get(
  '/games',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = limitSchema.safeParse(req.query.limit);
      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: '4001',
            message: '无效的limit参数',
            details: { limit: req.query.limit },
          },
        });
        return;
      }

      const limit = parseResult.data;
      const games = limit !== undefined ? await getAllGames(limit) : await getAllGames();

      setCacheHeaders(res, GAMES_CACHE_MAX_AGE);
      res.json({
        success: true,
        data: games,
        meta: {
          total_count: games.length,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

/**
 * GET /api/public/standings
 * Get team standings
 */
router.get(
  '/standings',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const standings = await getStandings();

      setCacheHeaders(res);
      res.json({
        success: true,
        data: standings,
        meta: {
          count: standings.length,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

/**
 * GET /api/public/leaders
 * Get statistical leaders
 */
router.get(
  '/leaders',
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate category
      const categoryResult = categorySchema.safeParse(req.query.category);
      if (!categoryResult.success && req.query.category !== undefined) {
        res.status(400).json({
          error: {
            code: '4001',
            message: '无效的category参数',
            details: {
              category: req.query.category,
              validCategories: [
                'batting_average',
                'home_runs',
                'rbis',
                'hits',
                'runs',
                'doubles',
                'triples',
                'walks',
              ],
            },
          },
        });
        return;
      }

      const category = categoryResult.data || 'batting_average';

      // Validate limit
      const limitResult = limitSchema.safeParse(req.query.limit);
      if (!limitResult.success) {
        res.status(400).json({
          error: {
            code: '4001',
            message: '无效的limit参数',
            details: { limit: req.query.limit },
          },
        });
        return;
      }

      const limit = limitResult.data || 10;
      const leaders = await getLeaders(category, limit);

      setCacheHeaders(res);
      res.json({
        success: true,
        data: leaders,
        meta: {
          count: leaders.length,
          category,
          limit,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

/**
 * GET /api/public/recent-games
 * Get recent completed games with highlights
 */
router.get(
  '/recent-games',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = limitSchema.safeParse(req.query.limit);
      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: '4001',
            message: '无效的limit参数',
            details: { limit: req.query.limit },
          },
        });
        return;
      }

      const limit = parseResult.data || 3;
      const games = await getRecentGameResults(limit);

      setCacheHeaders(res);
      res.json({
        success: true,
        data: games,
        meta: {
          count: games.length,
          limit,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

export default router;
