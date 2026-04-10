/**
 * Videos Routes Tests
 * Tests video list, detail, upload, and highlight endpoints
 */

import request from 'supertest';
import app from '../../app';
import pool from '../../config/database';
import { generateToken } from '../../middleware/auth';
import { hashPassword } from '../../utils/password';

describe('Videos Routes', () => {
  let adminToken: string;
  let adminId: string;
  let playerToken: string;
  let playerId: string;
  let teamAId: number;
  let teamBId: number;
  let gameId: number;
  let videoId: number;

  beforeAll(async () => {
    const passwordHash = await hashPassword('adminpass');
    const adminResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['videos_admin', passwordHash, 'Video Admin', 'admin', 'active']
    );
    adminId = adminResult.rows[0].id.toString();
    adminToken = generateToken(adminId, 'admin');

    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['videos_player', passwordHash, 'Video Player', 'player', 'active']
    );
    playerId = playerResult.rows[0].id.toString();
    playerToken = generateToken(playerId, 'player');

    const teamAResult = await pool.query(
      `INSERT INTO teams (name, division, wins, losses) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Video Team A', 'A', 0, 0]
    );
    teamAId = teamAResult.rows[0].id;

    const teamBResult = await pool.query(
      `INSERT INTO teams (name, division, wins, losses) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Video Team B', 'A', 0, 0]
    );
    teamBId = teamBResult.rows[0].id;

    const gameResult = await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['2026-05-01T14:00:00Z', 'Test Stadium', teamAId, teamBId, 'completed']
    );
    gameId = gameResult.rows[0].id;

    const videoResult = await pool.query(
      `INSERT INTO videos (game_id, title, description, video_url, thumbnail_url, uploaded_by, status, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [gameId, 'Test Video', 'Desc', 'https://cdn.example.com/video.mp4', 'https://cdn.example.com/thumb.jpg', adminId, 'ready', 3600]
    );
    videoId = videoResult.rows[0].id;

    await pool.query(
      `INSERT INTO video_highlights (video_id, title, description, start_time, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [videoId, 'Great Play', 'Amazing catch', 120, 135, adminId]
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM video_highlights WHERE video_id = $1', [videoId]);
    await pool.query('DELETE FROM videos WHERE id = $1', [videoId]);
    await pool.query('DELETE FROM games WHERE home_team_id IN ($1, $2) OR away_team_id IN ($1, $2)', [teamAId, teamBId]);
    await pool.query('DELETE FROM teams WHERE id IN ($1, $2)', [teamAId, teamBId]);
    await pool.query('DELETE FROM users WHERE username IN ($1, $2)', ['videos_admin', 'videos_player']);
  });

  describe('GET /api/videos', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/videos');
      expect(response.status).toBe(401);
    });

    it('should return video list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const video = response.body.data.find((v: { id: number }) => v.id === videoId);
      expect(video).toBeDefined();
      expect(video.title).toBe('Test Video');
      expect(video.highlights_count).toBe(1);
    });
  });

  describe('GET /api/videos/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get(`/api/videos/${videoId}`);
      expect(response.status).toBe(401);
    });

    it('should return video details with highlights', async () => {
      const response = await request(app)
        .get(`/api/videos/${videoId}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(videoId);
      expect(Array.isArray(response.body.data.highlights)).toBe(true);
      expect(response.body.data.highlights[0].title).toBe('Great Play');
    });

    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/videos/999999')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid video id', async () => {
      const response = await request(app)
        .get('/api/videos/abc')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/videos/upload-init', () => {
    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post('/api/videos/upload-init')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ game_id: gameId, file_name: 'test.mp4', file_size: 1024, mime_type: 'video/mp4' });

      expect(response.status).toBe(403);
    });

    it('should initialize upload for admin', async () => {
      const response = await request(app)
        .post('/api/videos/upload-init')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ game_id: gameId, file_name: 'test.mp4', file_size: 1024, mime_type: 'video/mp4' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.video_id).toBeDefined();
      expect(response.body.data.presigned_url).toBeDefined();

      // Cleanup
      await pool.query('DELETE FROM videos WHERE id = $1', [response.body.data.video_id]);
    });
  });

  describe('POST /api/videos/upload-complete', () => {
    let uploadVideoId: number;

    beforeAll(async () => {
      const result = await pool.query(
        `INSERT INTO videos (game_id, title, description, video_url, uploaded_by, status, file_size_bytes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [gameId, 'Incomplete', '', '', adminId, 'processing', 1024]
      );
      uploadVideoId = result.rows[0].id;
    });

    afterAll(async () => {
      await pool.query('DELETE FROM videos WHERE id = $1', [uploadVideoId]);
    });

    it('should complete upload for admin', async () => {
      const response = await request(app)
        .post('/api/videos/upload-complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ video_id: uploadVideoId, object_key: 'https://cdn.example.com/final.mp4', duration: 120 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for already completed upload', async () => {
      const response = await request(app)
        .post('/api/videos/upload-complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ video_id: uploadVideoId, object_key: 'https://cdn.example.com/final.mp4', duration: 120 });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/videos/:id/highlights', () => {
    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post(`/api/videos/${videoId}/highlights`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ title: 'HR', description: 'Home run', time: 60 });

      expect(response.status).toBe(403);
    });

    it('should create highlight for admin', async () => {
      const response = await request(app)
        .post(`/api/videos/${videoId}/highlights`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'HR', description: 'Home run', time: 60 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('HR');
      expect(response.body.data.start_time).toBe(60);

      // Cleanup
      if (response.body.data.id) {
        await pool.query('DELETE FROM video_highlights WHERE id = $1', [response.body.data.id]);
      }
    });
  });

  describe('DELETE /api/videos/:id/highlights/:highlightId', () => {
    let highlightId: number;

    beforeAll(async () => {
      const result = await pool.query(
        `INSERT INTO video_highlights (video_id, title, description, start_time, end_time, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [videoId, 'To Delete', 'Description', 10, 25, adminId]
      );
      highlightId = result.rows[0].id;
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/videos/${videoId}/highlights/${highlightId}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
    });

    it('should delete highlight for admin', async () => {
      const response = await request(app)
        .delete(`/api/videos/${videoId}/highlights/${highlightId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
