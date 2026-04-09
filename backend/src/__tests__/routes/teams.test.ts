import request from 'supertest';
import app from '../../app';
import pool from '../../config/database';
import { generateToken } from '../../middleware/auth';
import { hashPassword } from '../../utils/password';

describe('Teams Routes', () => {
  let playerToken: string;
  let playerUserId: string;
  let teamAId: number;
  let teamBId: number;

  beforeAll(async () => {
    const passwordHash = await hashPassword('playerpass');
    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['teamsroutes_player', passwordHash, 'Teams Routes Player', 'player', 'active']
    );
    playerUserId = playerResult.rows[0].id.toString();
    playerToken = generateToken(playerUserId, 'player');

    const teamAResult = await pool.query(
      `INSERT INTO teams (name, division, logo_url, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Teams Route A', '大联盟', 'https://example.com/a.png', 'Desc A']
    );
    teamAId = teamAResult.rows[0].id;

    const teamBResult = await pool.query(
      `INSERT INTO teams (name, division, logo_url, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Teams Route B', '大联盟', 'https://example.com/b.png', 'Desc B']
    );
    teamBId = teamBResult.rows[0].id;

    await pool.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['teams_member_a', passwordHash, 'Member A', teamAId, 1, '投手', 'player', 'active']
    );

    await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status, home_score, away_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['2026-01-01 14:00:00+08', 'Stadium', teamAId, teamBId, 'completed', 5, 3]
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM games WHERE home_team_id = $1 OR away_team_id = $1 OR home_team_id = $2 OR away_team_id = $2', [teamAId, teamBId]);
    await pool.query('DELETE FROM users WHERE team_id = $1 OR team_id = $2 OR username = $3', [teamAId, teamBId, 'teamsroutes_player']);
    await pool.query('DELETE FROM teams WHERE id = $1 OR id = $2', [teamAId, teamBId]);
  });

  describe('GET /api/teams/:id', () => {
    it('returns team with record', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamAId}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Teams Route A');
      expect(res.body.data.record).toBeDefined();
    });

    it('returns 404 for non-existent team', async () => {
      const res = await request(app)
        .get('/api/teams/999999')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for invalid teamId', async () => {
      const res = await request(app)
        .get('/api/teams/abc')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`/api/teams/${teamAId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/teams/:id/members', () => {
    it('returns member list', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamAId}/members`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.count).toBeGreaterThanOrEqual(1);
    });

    it('returns 400 for invalid teamId', async () => {
      const res = await request(app)
        .get('/api/teams/abc/members')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/teams/:id/games', () => {
    it('returns recent games with default limit', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamAId}/games`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.limit).toBe(3);
    });

    it('respects custom limit', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamAId}/games?limit=1`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.limit).toBe(1);
    });

    it('returns 400 for invalid limit', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamAId}/games?limit=15`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
