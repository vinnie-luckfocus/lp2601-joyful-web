/**
 * Games Routes Tests
 * Tests protected game list and detail endpoints
 */

import request from 'supertest';
import app from '../../app';
import pool from '../../config/database';
import { generateToken } from '../../middleware/auth';
import { hashPassword } from '../../utils/password';

describe('Games Routes', () => {
  let playerToken: string;
  let playerUserId: string;
  let teamAId: number;
  let teamBId: number;
  let gameId: number;
  let teamAName: string;
  let teamBName: string;

  beforeAll(async () => {
    teamAName = `Team Alpha ${Date.now()}`;
    teamBName = `Team Beta ${Date.now()}`;

    // Create test player user
    const passwordHash = await hashPassword('playerpass');
    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['gameroutes_player', passwordHash, 'Game Routes Player', 'player', 'active']
    );
    playerUserId = playerResult.rows[0].id.toString();
    playerToken = generateToken(playerUserId, 'player');

    // Create test teams
    const teamAResult = await pool.query(
      `INSERT INTO teams (name, division, wins, losses)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [teamAName, 'A', 0, 0]
    );
    teamAId = teamAResult.rows[0].id;

    const teamBResult = await pool.query(
      `INSERT INTO teams (name, division, wins, losses)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [teamBName, 'A', 0, 0]
    );
    teamBId = teamBResult.rows[0].id;

    // Create a test game
    const gameResult = await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['2026-05-01T14:00:00Z', 'Test Stadium', teamAId, teamBId, 'scheduled']
    );
    gameId = gameResult.rows[0].id;

    // Set player attendance to confirmed
    await pool.query(
      `INSERT INTO game_attendance (game_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (game_id, user_id) DO UPDATE SET status = $3`,
      [gameId, playerUserId, 'confirmed']
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM game_attendance WHERE user_id = $1', [playerUserId]);
    await pool.query('DELETE FROM games WHERE home_team_id IN ($1, $2) OR away_team_id IN ($1, $2)', [teamAId, teamBId]);
    await pool.query('DELETE FROM teams WHERE id IN ($1, $2)', [teamAId, teamBId]);
    await pool.query('DELETE FROM users WHERE username = $1', ['gameroutes_player']);
  });

  describe('GET /api/games', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/games');
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return all games with my_status for authenticated user', async () => {
      const response = await request(app)
        .get('/api/games')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const game = response.body.data.find((g: { id: number }) => g.id === gameId);
      expect(game).toBeDefined();
      expect(game.my_status).toBe('confirmed');
      expect(game.home_team_name).toBe(teamAName);
      expect(game.away_team_name).toBe(teamBName);
    });
  });

  describe('GET /api/games/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get(`/api/games/${gameId}`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return game details with my_status for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(gameId);
      expect(response.body.data.my_status).toBe('confirmed');
      expect(response.body.data.home_team_name).toBe(teamAName);
      expect(response.body.data.away_team_name).toBe(teamBName);
    });

    it('should return 400 for invalid gameId format', async () => {
      const response = await request(app)
        .get('/api/games/abc')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return null my_status when no attendance record exists', async () => {
      // Create a second game without attendance
      const game2Result = await pool.query(
        `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['2026-05-02T14:00:00Z', 'Another Stadium', teamAId, teamBId, 'scheduled']
      );
      const game2Id = game2Result.rows[0].id;

      const listResponse = await request(app)
        .get('/api/games')
        .set('Authorization', `Bearer ${playerToken}`);

      const game2 = listResponse.body.data.find((g: { id: number }) => g.id === game2Id);
      expect(game2).toBeDefined();
      expect(game2.my_status).toBeNull();

      const detailResponse = await request(app)
        .get(`/api/games/${game2Id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.my_status).toBeNull();

      await pool.query('DELETE FROM games WHERE id = $1', [game2Id]);
    });
  });

  describe('POST /api/games/:id/attend', () => {
    let attendeeToken: string;
    let attendeeUserId: string;
    let concurrencyToken: string;
    let concurrencyUserId: string;
    let rateLimitToken: string;
    let rateLimitUserId: string;
    let cutoffGameId: number;

    beforeAll(async () => {
      const passwordHash = await hashPassword('testpass');

      const attendeeResult = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
        ['gameroutes_attendee', passwordHash, 'Attendee', 'player', 'active']
      );
      attendeeUserId = attendeeResult.rows[0].id.toString();
      attendeeToken = generateToken(attendeeUserId, 'player');

      const concurrencyResult = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
        ['gameroutes_concurrency', passwordHash, 'Concurrency', 'player', 'active']
      );
      concurrencyUserId = concurrencyResult.rows[0].id.toString();
      concurrencyToken = generateToken(concurrencyUserId, 'player');

      const rateLimitResult = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
        ['gameroutes_ratelimit', passwordHash, 'Rate Limit', 'player', 'active']
      );
      rateLimitUserId = rateLimitResult.rows[0].id.toString();
      rateLimitToken = generateToken(rateLimitUserId, 'player');

      const cutoffResult = await pool.query(
        `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [new Date(Date.now() + 60 * 60 * 1000).toISOString(), 'Cutoff Stadium', teamAId, teamBId, 'scheduled']
      );
      cutoffGameId = cutoffResult.rows[0].id;
    });

    afterAll(async () => {
      await pool.query('DELETE FROM game_attendance WHERE user_id IN ($1, $2, $3)', [attendeeUserId, concurrencyUserId, rateLimitUserId]);
      await pool.query('DELETE FROM games WHERE id = $1', [cutoffGameId]);
      await pool.query('DELETE FROM users WHERE username IN ($1, $2, $3)', ['gameroutes_attendee', 'gameroutes_concurrency', 'gameroutes_ratelimit']);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attend`)
        .send({ status: 'confirmed' });
      expect(response.status).toBe(401);
    });

    it('should confirm attendance with valid token and status confirmed', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attend`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should decline attendance with status declined', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attend`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({ status: 'declined' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject signup within 2 hours of game start', async () => {
      const response = await request(app)
        .post(`/api/games/${cutoffGameId}/attend`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/cutoff|closed|too late|within 2 hours/i);
    });

    it('should reject invalid status values via Zod', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attend`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({ status: 'maybe' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject invalid gameId format', async () => {
      const response = await request(app)
        .post('/api/games/abc/attend')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle concurrent signups consistently', async () => {
      const promises = Array.from({ length: 10 }).map(() =>
        request(app)
          .post(`/api/games/${gameId}/attend`)
          .set('Authorization', `Bearer ${concurrencyToken}`)
          .send({ status: 'confirmed' })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter((r) => r.status === 200).length;

      expect(successCount).toBe(10);

      const attendanceResponse = await request(app)
        .get(`/api/games/${gameId}/attendance`)
        .set('Authorization', `Bearer ${concurrencyToken}`);

      const confirmedIds = attendanceResponse.body.data.confirmed.map((u: { id: string }) => u.id);
      expect(confirmedIds).toContain(concurrencyUserId);
    });

    it('should rate limit after 10 requests per minute', async () => {
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post(`/api/games/${gameId}/attend`)
          .set('Authorization', `Bearer ${rateLimitToken}`)
          .send({ status: 'confirmed' });
        expect([200, 429]).toContain(res.status);
      }

      const response = await request(app)
        .post(`/api/games/${gameId}/attend`)
        .set('Authorization', `Bearer ${rateLimitToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/too many requests|rate/i);
    });
  });

  describe('GET /api/games/:id/attendance', () => {
    let pendingUserToken: string;
    let pendingUserId: string;

    beforeAll(async () => {
      const passwordHash = await hashPassword('testpass');
      const result = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
        ['gameroutes_pending', passwordHash, 'Pending Player', 'player', 'active']
      );
      pendingUserId = result.rows[0].id.toString();
      pendingUserToken = generateToken(pendingUserId, 'player');
    });

    afterAll(async () => {
      await pool.query('DELETE FROM game_attendance WHERE user_id = $1', [pendingUserId]);
      await pool.query('DELETE FROM users WHERE username = $1', ['gameroutes_pending']);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get(`/api/games/${gameId}/attendance`);
      expect(response.status).toBe(401);
    });

    it('should return confirmed, declined, and pending lists', async () => {
      await pool.query(
        `INSERT INTO game_attendance (game_id, user_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (game_id, user_id) DO UPDATE SET status = $3`,
        [gameId, playerUserId, 'confirmed']
      );
      await pool.query(
        `INSERT INTO game_attendance (game_id, user_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (game_id, user_id) DO UPDATE SET status = $3`,
        [gameId, pendingUserId, 'declined']
      );

      const passwordHash = await hashPassword('testpass');
      const freshResult = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
        ['gameroutes_fresh', passwordHash, 'Fresh Player', 'player', 'active']
      );
      const freshUserId = freshResult.rows[0].id.toString();

      const response = await request(app)
        .get(`/api/games/${gameId}/attendance`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.confirmed)).toBe(true);
      expect(Array.isArray(response.body.data.declined)).toBe(true);
      expect(Array.isArray(response.body.data.pending)).toBe(true);

      const confirmedIds = response.body.data.confirmed.map((u: { id: string }) => u.id);
      const declinedIds = response.body.data.declined.map((u: { id: string }) => u.id);
      const pendingIds = response.body.data.pending.map((u: { id: string }) => u.id);

      expect(confirmedIds).toContain(playerUserId);
      expect(declinedIds).toContain(pendingUserId);
      expect(pendingIds).toContain(freshUserId);

      await pool.query('DELETE FROM game_attendance WHERE user_id = $1', [freshUserId]);
      await pool.query('DELETE FROM users WHERE username = $1', ['gameroutes_fresh']);
    });
  });
});
