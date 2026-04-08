/**
 * API Integration Tests
 * Tests end-to-end API flows
 * Coverage: PRD01 - Full API workflow tests
 */

import request from 'supertest';
import app from '../../backend/src/app';
import pool from '../../backend/src/config/database';
import { hashPassword } from '../../backend/src/utils/password';
import { generateToken } from '../../backend/src/middleware/auth';

describe('API Integration Tests', () => {
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Ensure admin exists
    const adminHash = await hashPassword('admin123');
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET password_hash = $2 RETURNING id`,
      ['admin', adminHash, 'System Admin', 'admin', 'active']
    );
    adminId = result.rows[0].id.toString();
    adminToken = generateToken(adminId, 'admin');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Authentication Flow', () => {
    it('should complete full login and me workflow', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();

      // Get user info
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.name).toBe('System Admin');

      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(logoutRes.status).toBe(200);
    });
  });

  describe('Admin Access Control', () => {
    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject access without token', async () => {
      const response = await request(app).get('/api/admin/dashboard');

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle 404 routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/auth/login')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
