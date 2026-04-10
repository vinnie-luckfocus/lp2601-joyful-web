/**
 * Admin Routes Tests
 * Tests admin-only endpoints
 * Coverage: PRD01 - Admin API requirements
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
import { generateToken } from '../../middleware/auth';

describe('Admin Routes', () => {
  let adminToken: string;
  let playerToken: string;

  beforeAll(() => {
    adminToken = generateToken('1', 'admin');
    playerToken = generateToken('2', 'player');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/dashboard', () => {
    it('should allow admin access', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin dashboard');
    });

    it('should reject player access', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject unauthenticated access', async () => {
      const response = await request(app).get('/api/admin/dashboard');

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Admin User', role: 'admin', team_id: null },
          { id: 2, name: 'Player User', role: 'player', team_id: 1 },
        ],
      });

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should reject player access', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch users');
    });

    it('should return empty array when no users exist', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return users with correct fields', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Admin User', role: 'admin', team_id: null },
          { id: 2, name: 'Player User', role: 'player', team_id: 1 },
        ],
      });

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
      expect(response.body[0]).toHaveProperty('team_id');
      expect(response.body[0].role).toBe('admin');
      expect(response.body[1].team_id).toBe(1);
    });
  });
});
