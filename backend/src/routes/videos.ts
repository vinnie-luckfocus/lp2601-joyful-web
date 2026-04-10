/**
 * Videos Routes
 * Endpoints for video replay system
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  getVideos,
  getVideoById,
  createVideoUpload,
  completeVideoUpload,
  createHighlight,
  deleteHighlight,
} from '../services/videos';

const router = Router();

const videoIdSchema = z.string()
  .regex(/^\d+$/, 'videoId must be a positive integer')
  .transform((val) => parseInt(val, 10))
  .refine((val) => val > 0, 'videoId must be a positive integer');

const listQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).default('20'),
  offset: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).default('0'),
});

const uploadInitSchema = z.object({
  game_id: z.number().int().positive().nullable().optional(),
  file_name: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1).max(100),
});

const uploadCompleteSchema = z.object({
  video_id: z.number().int().positive(),
  object_key: z.string().min(1).max(1000),
  duration: z.number().int().positive(),
});

const highlightBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  time: z.number().int().min(0),
});

/**
 * GET /api/videos
 * List videos with pagination
 */
router.get(
  '/',
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid query parameters',
          meta: {},
        });
        return;
      }

      const { limit, offset } = parsed.data;
      const videos = await getVideos(limit, offset);

      res.json({
        success: true,
        data: videos,
        error: null,
        meta: {
          limit,
          offset,
          count: videos.length,
        },
      });
    } catch (error) {
      console.error('Error listing videos:', error);
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
 * GET /api/videos/:id
 * Get video details with highlights
 */
router.get(
  '/:id',
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedId = videoIdSchema.safeParse(req.params.id);
      if (!parsedId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid video ID',
          meta: {},
        });
        return;
      }

      const video = await getVideoById(parsedId.data);
      if (!video) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Video not found',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: video,
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Error getting video:', error);
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
 * POST /api/videos/upload-init
 * Initialize a video upload (admin only)
 */
router.post(
  '/upload-init',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = uploadInitSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid request body',
          meta: {},
        });
        return;
      }

      const { game_id, file_name, file_size, mime_type } = parsed.data;
      const adminId = parseInt(req.user!.userId, 10);

      const result = await createVideoUpload(
        game_id ?? null,
        file_name,
        file_name,
        file_size,
        mime_type,
        adminId
      );

      res.status(201).json({
        success: true,
        data: {
          video_id: result.id,
          presigned_url: result.presignedUrl,
          expires_at: result.expiresAt,
        },
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Error initializing upload:', error);
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
 * POST /api/videos/upload-complete
 * Complete a video upload (admin only)
 */
router.post(
  '/upload-complete',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = uploadCompleteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid request body',
          meta: {},
        });
        return;
      }

      const { video_id, object_key, duration } = parsed.data;
      const updated = await completeVideoUpload(video_id, object_key, duration);

      if (!updated) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Video upload not found or already completed',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: { video_id },
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Error completing upload:', error);
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
 * POST /api/videos/:id/highlights
 * Create a highlight (admin only)
 */
router.post(
  '/:id/highlights',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedId = videoIdSchema.safeParse(req.params.id);
      if (!parsedId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid video ID',
          meta: {},
        });
        return;
      }

      const parsedBody = highlightBodySchema.safeParse(req.body);
      if (!parsedBody.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid request body',
          meta: {},
        });
        return;
      }

      const videoId = parsedId.data;
      const { title, description, time } = parsedBody.data;
      const adminId = parseInt(req.user!.userId, 10);
      const endTime = time + 15;

      const video = await getVideoById(videoId);
      if (!video) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Video not found',
          meta: {},
        });
        return;
      }

      const result = await createHighlight(videoId, title, description, time, endTime, adminId);

      res.status(201).json({
        success: true,
        data: {
          id: result.id,
          video_id: videoId,
          title,
          description,
          start_time: time,
          end_time: endTime,
        },
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Error creating highlight:', error);
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
 * DELETE /api/videos/:id/highlights/:highlightId
 * Delete a highlight (admin only)
 */
router.delete(
  '/:id/highlights/:highlightId',
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedVideoId = videoIdSchema.safeParse(req.params.id);
      const parsedHighlightId = videoIdSchema.safeParse(req.params.highlightId);

      if (!parsedVideoId.success || !parsedHighlightId.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid ID format',
          meta: {},
        });
        return;
      }

      const deleted = await deleteHighlight(parsedVideoId.data, parsedHighlightId.data);
      if (!deleted) {
        res.status(404).json({
          success: false,
          data: null,
          error: 'Highlight not found',
          meta: {},
        });
        return;
      }

      res.json({
        success: true,
        data: null,
        error: null,
        meta: {},
      });
    } catch (error) {
      console.error('Error deleting highlight:', error);
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
