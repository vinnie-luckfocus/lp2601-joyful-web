/**
 * Public Routes Integration Tests
 * Tests public game schedule endpoint with real database
 */

import request from 'supertest';
import app from '../../../backend/src/app';
import pool from '../../../backend/src/config/database';

describe('Public Routes', () => {
  const testTeams: { id: number; name: string }[] = [];
  const suffix = Date.now().toString(36);
  const teamNames = [
    `Team Alpha ${suffix}`,
    `Team Beta ${suffix}`,
    `Team Gamma ${suffix}`,
    `Team Delta ${suffix}`,
  ];

  beforeAll(async () => {
    // Create test teams with unique names to avoid conflicts
    for (const name of teamNames) {
      const result = await pool.query(
        `INSERT INTO teams (name, division, wins, losses)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [name, 'Test Division', 0, 0]
      );
      testTeams.push({ id: result.rows[0].id, name });
    }

    // Create test games spanning multiple dates (more than 7 days ago and future)
    const now = new Date();
    const gameData = [
      {
        scheduled_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        location: 'Stadium A',
        home_team_id: testTeams[0].id,
        away_team_id: testTeams[1].id,
        status: 'completed',
      },
      {
        scheduled_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        location: 'Stadium B',
        home_team_id: testTeams[2].id,
        away_team_id: testTeams[3].id,
        status: 'scheduled',
      },
      {
        scheduled_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        location: 'Stadium C',
        home_team_id: testTeams[1].id,
        away_team_id: testTeams[2].id,
        status: 'scheduled',
      },
      {
        scheduled_at: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        location: 'Stadium D',
        home_team_id: testTeams[3].id,
        away_team_id: testTeams[0].id,
        status: 'scheduled',
      },
      {
        scheduled_at: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        location: 'Stadium E',
        home_team_id: testTeams[0].id,
        away_team_id: testTeams[2].id,
        status: 'scheduled',
      },
    ];

    for (const game of gameData) {
      await pool.query(
        `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [game.scheduled_at.toISOString(), game.location, game.home_team_id, game.away_team_id, game.status]
      );
    }
  });

  afterAll(async () => {
    // Cleanup games first (foreign key constraint)
    await pool.query(
      `DELETE FROM games WHERE home_team_id = ANY($1) OR away_team_id = ANY($1)`,
      [testTeams.map((t) => t.id)]
    );
    // Cleanup teams
    await pool.query('DELETE FROM teams WHERE name = ANY($1)', [teamNames]);
  });

  describe('GET /api/public/games', () => {
    it('should return all games sorted by scheduled_at ascending by default', async () => {
      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total_count).toBeGreaterThanOrEqual(5);

      const games = response.body.data;
      expect(games.length).toBeGreaterThanOrEqual(5);

      // Verify ascending sort by scheduled_at
      for (let i = 1; i < games.length; i++) {
        expect(new Date(games[i].scheduled_at).getTime()).toBeGreaterThanOrEqual(
          new Date(games[i - 1].scheduled_at).getTime()
        );
      }
    });

    it('should return only limited games when ?limit is provided', async () => {
      const response = await request(app).get('/api/public/games?limit=2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.total_count).toBe(2);
    });

    it('should include required fields for each game', async () => {
      const response = await request(app).get('/api/public/games?limit=1');

      expect(response.status).toBe(200);
      const game = response.body.data[0];
      expect(game.id).toBeDefined();
      expect(game.scheduled_at).toBeDefined();
      expect(game.location).toBeDefined();
      expect(game.home_team).toBeDefined();
      expect(game.away_team).toBeDefined();
      expect(game.status).toBeDefined();
    });

    it('should return Cache-Control header with public, max-age=60', async () => {
      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('should reject invalid limit parameter', async () => {
      const response = await request(app).get('/api/public/games?limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
