/**
 * Public API Routes Tests
 * Tests for public endpoints: games, standings, leaders, recent-games
 */

import request from 'supertest';
import app from '../../app';

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from '../../config/database';

const mockQuery = pool.query as jest.Mock;

describe('Public API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/public/games', () => {
    it('should return all games with no limit by default', async () => {
      const mockGames = [
        {
          id: 1,
          scheduled_at: '2026-04-10T14:00:00Z',
          location: 'Stadium A',
          home_team: { id: 1, name: 'A队' },
          away_team: { id: 2, name: 'B队' },
          status: 'scheduled',
        },
        {
          id: 2,
          scheduled_at: '2026-04-11T14:00:00Z',
          location: 'Stadium B',
          home_team: { id: 3, name: 'C队' },
          away_team: { id: 4, name: 'D队' },
          status: 'scheduled',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockGames });

      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGames);
      expect(response.body.meta.total_count).toBe(2);
      expect(response.headers['cache-control']).toContain('max-age=60');
    });

    it('should return games with custom limit', async () => {
      const mockGames = [
        {
          id: 1,
          scheduled_at: '2026-04-10T14:00:00Z',
          location: 'Stadium A',
          home_team: { id: 1, name: 'A队' },
          away_team: { id: 2, name: 'B队' },
          status: 'scheduled',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockGames });

      const response = await request(app).get('/api/public/games?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total_count).toBe(1);
    });

    it('should reject invalid limit parameter', async () => {
      const response = await request(app).get('/api/public/games?limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('4001');
      expect(response.body.error.message).toContain('无效');
    });

    it('should reject negative limit', async () => {
      const response = await request(app).get('/api/public/games?limit=-1');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('4001');
    });

    it('should handle database errors with retry', async () => {
      // First two calls fail, third succeeds
      mockQuery
        .mockRejectedValueOnce(new Error('connection failed'))
        .mockRejectedValueOnce(new Error('connection failed'))
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should return 503 after all retries exhausted', async () => {
      mockQuery.mockRejectedValue(new Error('connection refused'));

      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('5001');
      expect(response.body.error.message).toContain('数据库连接失败');
    });

    it('should return 504 on timeout', async () => {
      mockQuery.mockRejectedValue(new Error('timeout'));

      const response = await request(app).get('/api/public/games');

      expect(response.status).toBe(504);
      expect(response.body.error.code).toBe('5002');
      expect(response.body.error.message).toContain('超时');
    });
  });

  describe('GET /api/public/standings', () => {
    it('should return team standings', async () => {
      const mockStandings = [
        {
          id: 1,
          name: 'A队',
          division: '大联盟',
          wins: 10,
          losses: 2,
          win_percentage: 83.33,
        },
        {
          id: 2,
          name: 'B队',
          division: '大联盟',
          wins: 8,
          losses: 4,
          win_percentage: 66.67,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockStandings });

      const response = await request(app).get('/api/public/standings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStandings);
      expect(response.headers['cache-control']).toContain('max-age=300');
    });

    it('should return empty array when no teams', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/public/standings');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('database error'));

      const response = await request(app).get('/api/public/standings');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/public/leaders', () => {
    it('should return batting average leaders by default', async () => {
      const mockLeaders = [
        {
          user_id: 1,
          player_name: '张三',
          jersey_number: 10,
          team_name: 'A队',
          value: 0.385,
          category: 'batting_average',
        },
        {
          user_id: 2,
          player_name: '李四',
          jersey_number: 15,
          team_name: 'B队',
          value: 0.342,
          category: 'batting_average',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const response = await request(app).get('/api/public/leaders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLeaders);
      expect(response.body.meta.category).toBe('batting_average');
      expect(response.headers['cache-control']).toContain('max-age=300');
    });

    it('should return home run leaders', async () => {
      const mockLeaders = [
        {
          user_id: 1,
          player_name: '张三',
          jersey_number: 10,
          team_name: 'A队',
          value: 15,
          category: 'home_runs',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const response = await request(app).get('/api/public/leaders?category=home_runs');

      expect(response.status).toBe(200);
      expect(response.body.meta.category).toBe('home_runs');
      expect(response.body.data[0].value).toBe(15);
    });

    it('should return RBI leaders', async () => {
      const mockLeaders = [
        {
          user_id: 1,
          player_name: '张三',
          jersey_number: 10,
          team_name: 'A队',
          value: 45,
          category: 'rbis',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const response = await request(app).get('/api/public/leaders?category=rbis');

      expect(response.status).toBe(200);
      expect(response.body.meta.category).toBe('rbis');
    });

    it('should respect limit parameter', async () => {
      const mockLeaders = Array(5).fill({
        user_id: 1,
        player_name: 'Player',
        jersey_number: 1,
        team_name: 'Team',
        value: 0.3,
        category: 'batting_average',
      });

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const response = await request(app).get('/api/public/leaders?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should reject invalid category', async () => {
      const response = await request(app).get('/api/public/leaders?category=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('4001');
    });

    it('should reject invalid limit', async () => {
      const response = await request(app).get('/api/public/leaders?limit=100');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('4001');
    });
  });

  describe('GET /api/public/recent-games', () => {
    it('should return recent completed games with highlights', async () => {
      // Mock the main game query
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            scheduled_at: '2026-04-05T14:00:00Z',
            location: 'Stadium A',
            home_team_name: 'A队',
            away_team_name: 'B队',
            home_score: 5,
            away_score: 3,
          },
        ],
      });

      // Mock the HR query
      mockQuery.mockResolvedValueOnce({
        rows: [{ player: '张三', count: 2 }],
      });

      // Mock the RBI query
      mockQuery.mockResolvedValueOnce({
        rows: [{ player: '李四', count: 3 }],
      });

      const response = await request(app).get('/api/public/recent-games');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].highlights).toBeDefined();
      expect(response.body.data[0].highlights).toHaveLength(2);
      expect(response.headers['cache-control']).toContain('max-age=300');
    });

    it('should return games with default limit of 3', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, home_team_name: 'A队', away_team_name: 'B队', home_score: 5, away_score: 3 },
          { id: 2, home_team_name: 'C队', away_team_name: 'D队', home_score: 4, away_score: 6 },
          { id: 3, home_team_name: 'E队', away_team_name: 'F队', home_score: 7, away_score: 2 },
        ],
      });

      // Mock highlights queries for each game
      for (let i = 0; i < 3; i++) {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        mockQuery.mockResolvedValueOnce({ rows: [] });
      }

      const response = await request(app).get('/api/public/recent-games');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.limit).toBe(3);
    });

    it('should respect custom limit', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, home_team_name: 'A队', away_team_name: 'B队', home_score: 5, away_score: 3 },
        ],
      });

      // Mock highlights queries
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/public/recent-games?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.limit).toBe(1);
    });

    it('should reject invalid limit', async () => {
      const response = await request(app).get('/api/public/recent-games?limit=0');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('4001');
    });

    it('should handle games without highlights', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            scheduled_at: '2026-04-05T14:00:00Z',
            location: 'Stadium A',
            home_team_name: 'A队',
            away_team_name: 'B队',
            home_score: 1,
            away_score: 0,
          },
        ],
      });

      // No HRs
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // No RBIs
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/public/recent-games');

      expect(response.status).toBe(200);
      expect(response.body.data[0].highlights).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('database error'));

      const response = await request(app).get('/api/public/recent-games');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should return unified error format for invalid parameter', async () => {
      const response = await request(app).get('/api/public/games?limit=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('4001');
      expect(response.body.error.message).toBeDefined();
      expect(response.body.error.details).toBeDefined();
    });

    it('should include error details', async () => {
      const response = await request(app).get('/api/public/leaders?category=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.details).toHaveProperty('category');
      expect(response.body.error.details).toHaveProperty('validCategories');
    });
  });

  describe('Cache Headers', () => {
    it('should set Cache-Control for all endpoints', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const endpoints = ['/api/public/standings', '/api/public/leaders'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['cache-control']).toContain('max-age=300');
        expect(response.headers['cache-control']).toContain('public');
      }

      const gamesResponse = await request(app).get('/api/public/games');
      expect(gamesResponse.headers['cache-control']).toContain('max-age=60');
      expect(gamesResponse.headers['cache-control']).toContain('public');
    });
  });
});
