/**
 * Admin Routes Tests
 * Tests admin-only endpoints
 * Coverage: PRD01 - Admin API requirements
 */

import request from 'supertest';
import app from '../../../backend/src/app';
import pool from '../../../backend/src/config/database';
import { generateToken } from '../../../backend/src/middleware/auth';
import { hashPassword } from '../../../backend/src/utils/password';

describe('Admin Routes', () => {
  let adminToken: string;
  let playerToken: string;

  beforeAll(async () => {
    // Create admin user
    const adminHash = await hashPassword('adminpass');
    const adminResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['testadmin', adminHash, 'Test Admin', 'admin', 'active']
    );
    adminToken = generateToken(adminResult.rows[0].id.toString(), 'admin');

    // Create player user
    const playerHash = await hashPassword('playerpass');
    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET role = $4 RETURNING id`,
      ['testplayer', playerHash, 'Test Player', 'player', 'active']
    );
    playerToken = generateToken(playerResult.rows[0].id.toString(), 'player');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username IN ($1, $2)', ['testadmin', 'testplayer']);
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
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject player access', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
    });
  });
});
