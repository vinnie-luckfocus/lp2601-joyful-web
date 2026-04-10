/**
 * Stats Routes Tests
 */

import request from 'supertest';
import app from '../../app';
import pool from '../../config/database';
import { generateToken } from '../../middleware/auth';
import { hashPassword } from '../../utils/password';

describe('Stats Routes', () => {
  let playerToken: string;
  let playerUserId: string;
  let adminToken: string;
  let adminUserId: string;
  let gameId: number;

  beforeAll(async () => {
    const passwordHash = await hashPassword('testpass');

    // Create test player
    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status, team_id, jersey_number, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['stats_player', passwordHash, 'Stats Player', 'player', 'active', 1, 10, '投手']
    );
    playerUserId = playerResult.rows[0].id.toString();
    playerToken = generateToken(playerUserId, 'player');

    // Create test admin
    const adminResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['stats_admin', passwordHash, 'Stats Admin', 'admin', 'active']
    );
    adminUserId = adminResult.rows[0].id.toString();
    adminToken = generateToken(adminUserId, 'admin');

    // Get a game to attach stats to
    const gameResult = await pool.query('SELECT id FROM games LIMIT 1');
    gameId = gameResult.rows[0]?.id;

    if (!gameId) {
      const teams = await pool.query('SELECT id FROM teams LIMIT 2');
      const newGame = await pool.query(
        `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['2026-05-01T14:00:00Z', 'Test Stadium', teams.rows[0].id, teams.rows[1].id, 'completed']
      );
      gameId = newGame.rows[0].id;
    }

    // Insert batting record
    await pool.query(
      `INSERT INTO batting_records (game_id, user_id, at_bats, hits, doubles, triples, home_runs, rbis, runs, walks, strikeouts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (game_id, user_id) DO UPDATE SET
         at_bats = EXCLUDED.at_bats, hits = EXCLUDED.hits`,
      [gameId, playerUserId, 4, 2, 1, 0, 0, 1, 1, 0, 1]
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM batting_records WHERE user_id = $1', [playerUserId]);
    await pool.query('DELETE FROM users WHERE username IN ($1, $2)', ['stats_player', 'stats_admin']);
  });

  describe('GET /api/stats/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/stats/me');
      expect(response.status).toBe(401);
    });

    it('should return player stats for authenticated user', async () => {
      const response = await request(app)
        .get('/api/stats/me')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Stats Player');
      expect(response.body.data.cumulative.at_bats).toBe(4);
      expect(response.body.data.cumulative.hits).toBe(2);
      expect(response.body.data.cumulative.batting_avg).toBe(0.5);
      expect(response.body.data.cumulative.doubles).toBe(1);
    });
  });

  describe('POST /api/games/:id/batting-records', () => {
    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/batting-records`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ records: [{ user_id: parseInt(playerUserId), at_bats: 3, hits: 1 }] });

      expect(response.status).toBe(403);
    });

    it('should create batting records for admin', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/batting-records`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          records: [
            { user_id: parseInt(playerUserId), at_bats: 5, hits: 3, doubles: 1, home_runs: 1, rbis: 2, runs: 2, walks: 1, strikeouts: 1 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.recordIds)).toBe(true);
    });

    it('should validate request body with Zod', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/batting-records`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ records: [{ user_id: 'abc' }] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games/:id/batting-records', () => {
    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}/batting-records`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return batting records for admin', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}/batting-records`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const record = response.body.data.find((r: { user_id: string }) => r.user_id.toString() === playerUserId);
      expect(record).toBeDefined();
      expect(record.user_name).toBe('Stats Player');
    });

    it('should return 400 for invalid gameId format', async () => {
      const response = await request(app)
        .get('/api/games/abc/batting-records')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
