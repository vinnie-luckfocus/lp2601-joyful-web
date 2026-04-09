/**
 * Games Routes
 * Protected endpoints for game schedule
 */

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { verifyToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { getGames, getGameById, updateAttendance, getAttendance } from '../services/games';
import pool from '../config/database';

const router = Router();

const gameIdSchema = z.string().regex(/^\d+$/, 'gameId must be a positive integer').transform((val) => parseInt(val, 10)).refine((val) => val > 0, 'gameId must be a positive integer');

const attendBodySchema = z.object({
  status: z.enum(['confirmed', 'declined']),
});

const attendRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'anonymous',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      data: null,
      error: 'Too many requests, please try again later',
      meta: {},
    });
  },
});

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

/**
 * POST /api/games/:id/attend
 * Update attendance status with cutoff enforcement and rate limiting
 */
router.post(
  '/:id/attend',
  verifyToken,
  attendRateLimit,
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

      const parseId = gameIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const parseBody = attendBodySchema.safeParse(req.body);
      if (!parseBody.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid status value',
          meta: {},
        });
        return;
      }

      await updateAttendance(parseId.data, req.user.userId, parseBody.data.status);

      res.json({
        success: true,
        data: { gameId: parseId.data, status: parseBody.data.status },
        error: null,
        meta: {},
      });
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === 'CUTOFF_PASSED' || err.message.includes('within 2 hours')) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Signup is closed within 2 hours of game start',
          meta: {},
        });
        return;
      }
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
 * GET /api/games/:id/attendance
 * Get attendance lists for a game
 */
router.get(
  '/:id/attendance',
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

      const parseId = gameIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const attendance = await getAttendance(parseId.data);

      res.json({
        success: true,
        data: attendance,
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

/**
 * GET /api/games/:id/lineup
 * Get lineup and tactics for a game (team members only)
 */
router.get(
  '/:id/lineup',
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

      const parseId = gameIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const gameId = parseId.data;

      // Verify game exists and get team_ids
      const gameResult = await pool.query<{ home_team_id: number; away_team_id: number }>(
        'SELECT home_team_id, away_team_id FROM games WHERE id = $1',
        [gameId]
      );

      if (gameResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Game not found',
          meta: {},
        });
        return;
      }

      const { home_team_id, away_team_id } = gameResult.rows[0];

      // Verify user belongs to one of the game's teams
      const userResult = await pool.query<{ team_id: number | null }>(
        'SELECT team_id FROM users WHERE id = $1',
        [req.user.userId]
      );

      const userTeamId = userResult.rows[0]?.team_id;
      if (userTeamId !== home_team_id && userTeamId !== away_team_id) {
        res.status(403).json({
          success: false,
          data: null,
          error: 'You do not have access to this game',
          meta: {},
        });
        return;
      }

      // Fetch lineup
      const lineupResult = await pool.query(
        `
          SELECT
            gl.batting_order,
            gl.user_id,
            u.name,
            gl.position,
            gl.jersey_number
          FROM game_lineups gl
          JOIN users u ON gl.user_id = u.id
          WHERE gl.game_id = $1
          ORDER BY gl.batting_order ASC
        `,
        [gameId]
      );

      // Fetch tactics
      const tacticsResult = await pool.query(
        `
          SELECT
            general_notes,
            signals,
            defense_strategy
          FROM game_tactics
          WHERE game_id = $1
        `,
        [gameId]
      );

      const tactics = tacticsResult.rows[0] || {
        general_notes: null,
        signals: {},
        defense_strategy: null,
      };

      res.json({
        success: true,
        data: {
          game_id: gameId,
          lineup: lineupResult.rows,
          tactics: {
            general_notes: tactics.general_notes,
            signals: tactics.signals,
            defense_strategy: tactics.defense_strategy,
          },
        },
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Failed to fetch lineup:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        meta: {},
      });
    }
  }
);

const battingRecordSchema = z.object({
  user_id: z.number().int().positive(),
  at_bats: z.number().int().min(0).default(0),
  hits: z.number().int().min(0).default(0),
  doubles: z.number().int().min(0).default(0),
  triples: z.number().int().min(0).default(0),
  home_runs: z.number().int().min(0).default(0),
  rbis: z.number().int().min(0).default(0),
  runs: z.number().int().min(0).default(0),
  walks: z.number().int().min(0).default(0),
  strikeouts: z.number().int().min(0).default(0),
});

const battingRecordsBodySchema = z.object({
  records: z.array(battingRecordSchema).min(1),
});

/**
 * GET /api/games/:id/batting-records
 * Get batting records for a game (admin only)
 */
router.get(
  '/:id/batting-records',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseId = gameIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const gameId = parseId.data;

      const recordsResult = await pool.query(
        `
          SELECT
            br.id,
            br.user_id,
            u.name AS user_name,
            br.at_bats,
            br.hits,
            br.doubles,
            br.triples,
            br.home_runs,
            br.rbis,
            br.runs,
            br.walks,
            br.strikeouts
          FROM batting_records br
          JOIN users u ON br.user_id = u.id
          WHERE br.game_id = $1
          ORDER BY u.name ASC
        `,
        [gameId]
      );

      res.json({
        success: true,
        data: recordsResult.rows,
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Failed to fetch batting records:', error);
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
 * POST /api/games/:id/batting-records
 * Create or update batting records for a game (admin only)
 */
router.post(
  '/:id/batting-records',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseId = gameIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid gameId format',
          meta: {},
        });
        return;
      }

      const parseBody = battingRecordsBodySchema.safeParse(req.body);
      if (!parseBody.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid request body',
          meta: {},
        });
        return;
      }

      const gameId = parseId.data;
      const { records } = parseBody.data;
      const recordIds: number[] = [];

      for (const record of records) {
        const result = await pool.query(
          `
            INSERT INTO batting_records (
              game_id, user_id, at_bats, hits, doubles, triples, home_runs, rbis, runs, walks, strikeouts
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (game_id, user_id)
            DO UPDATE SET
              at_bats = EXCLUDED.at_bats,
              hits = EXCLUDED.hits,
              doubles = EXCLUDED.doubles,
              triples = EXCLUDED.triples,
              home_runs = EXCLUDED.home_runs,
              rbis = EXCLUDED.rbis,
              runs = EXCLUDED.runs,
              walks = EXCLUDED.walks,
              strikeouts = EXCLUDED.strikeouts,
              updated_at = NOW()
            RETURNING id
          `,
          [
            gameId,
            record.user_id,
            record.at_bats,
            record.hits,
            record.doubles,
            record.triples,
            record.home_runs,
            record.rbis,
            record.runs,
            record.walks,
            record.strikeouts,
          ]
        );
        recordIds.push(result.rows[0].id);
      }

      res.status(201).json({
        success: true,
        data: { recordIds },
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Failed to create batting records:', error);
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
