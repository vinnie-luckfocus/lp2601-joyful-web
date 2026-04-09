import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { verifyToken } from '../middleware/auth';
import {
  findById,
  findMembersByTeamId,
  findRecentGamesByTeamId,
  getRecordByTeamId,
} from '../repositories/TeamRepository';

const router = Router();

const teamIdSchema = z
  .string()
  .regex(/^\d+$/, 'teamId must be a positive integer')
  .transform((val) => parseInt(val, 10))
  .refine((val) => val > 0, 'teamId must be a positive integer');

const gamesLimitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 3))
  .refine((val) => !isNaN(val) && val > 0 && val <= 10, 'limit must be between 1 and 10');

const teamsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
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

router.get(
  '/:id',
  verifyToken,
  teamsRateLimit,
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

      const parseResult = teamIdSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid teamId format',
          meta: {},
        });
        return;
      }

      const teamId = parseResult.data;
      const [team, record] = await Promise.all([
        findById(teamId),
        getRecordByTeamId(teamId),
      ]);

      if (!team) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Team not found',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: { ...team, record },
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

router.get(
  '/:id/members',
  verifyToken,
  teamsRateLimit,
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

      const parseResult = teamIdSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid teamId format',
          meta: {},
        });
        return;
      }

      const teamId = parseResult.data;
      const members = await findMembersByTeamId(teamId);

      res.json({
        success: true,
        data: members,
        error: null,
        meta: {
          count: members.length,
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

router.get(
  '/:id/games',
  verifyToken,
  teamsRateLimit,
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

      const parseId = teamIdSchema.safeParse(req.params.id);
      if (!parseId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid teamId format',
          meta: {},
        });
        return;
      }

      const parseLimit = gamesLimitSchema.safeParse(req.query.limit as string | undefined);
      if (!parseLimit.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid limit value',
          meta: {},
        });
        return;
      }

      const teamId = parseId.data;
      const limit = parseLimit.data;
      const games = await findRecentGamesByTeamId(teamId, limit);

      res.json({
        success: true,
        data: games,
        error: null,
        meta: {
          count: games.length,
          limit,
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

export default router;
