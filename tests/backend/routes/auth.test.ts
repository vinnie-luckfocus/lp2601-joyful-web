/**
 * Authentication Routes Tests
 * Tests login, logout, and user info endpoints
 * Coverage: PRD01 - API Requirements for authentication
 */

import request from 'supertest';
import app from '../../../backend/src/app';
import pool from '../../../backend/src/config/database';
import { hashPassword } from '../../../backend/src/utils/password';

describe('Auth Routes', () => {
  const testUser = {
    username: 'testuser',
    password: 'testpass123',
    name: 'Test User',
    role: 'admin',
  };

  beforeAll(async () => {
    // Create test user in database
    const passwordHash = await hashPassword(testUser.password);
    await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
      [testUser.username, passwordHash, testUser.name, testUser.role, 'active']
    );
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE username = $1', [testUser.username]);
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.role).toBe(testUser.role);
    });

    it('should reject invalid username', async () => {
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
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
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
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });
      authToken = loginResponse.body.token;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.role).toBe(testUser.role);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });
      authToken = loginResponse.body.token;
    });

    it('should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
