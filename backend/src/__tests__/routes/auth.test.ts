/**
 * Authentication Routes Tests
 * Tests login, logout, and user info endpoints
 * Coverage: PRD01 - API Requirements for authentication
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
import { hashPassword } from '../../utils/password';
import { generateToken } from '../../middleware/auth';

describe('Auth Routes', () => {
  const mockUserBase = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    role: 'admin',
    team_id: null,
    jersey_number: null,
    position: null,
    password_hash: '',
    is_first_login: true,
  };

  let mockUser: typeof mockUserBase;

  beforeAll(async () => {
    mockUser = {
      ...mockUserBase,
      password_hash: await hashPassword('testpass123'),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(1);
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.team_id).toBeNull();
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.is_first_login).toBe(true);
    });

    it('should reject invalid username', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpass',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject short username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'ab',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input format');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input format');
    });

    it('should reject invalid username characters', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@user!',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input format');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should accept logout request with valid token', async () => {
      const token = generateToken('1', 'admin');

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app).post('/api/auth/logout');
      expect(response.status).toBe(401);
    });
  });
});
