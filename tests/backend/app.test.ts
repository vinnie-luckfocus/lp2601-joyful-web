/**
 * Express App Tests
 * Tests CORS, middleware, and base routes
 * Coverage: PRD01 - Backend framework requirements
 */

import request from 'supertest';
import app from '../../backend/src/app';

describe('Express App', () => {
  describe('CORS Configuration', () => {
    it('should allow requests from configured origins', async () => {
      const response = await request(app)
        .get('/api/auth/login')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
    });
  });

  describe('JSON Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test123' });

      // Should not get 400 for JSON parsing
      expect(response.status).not.toBe(400);
    });

    it('should reject requests with content length > 10kb', async () => {
      const largePayload = { data: 'x'.repeat(15000) };

      const response = await request(app)
        .post('/api/auth/login')
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('API Routes', () => {
    it('should mount auth routes under /api', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test' });

      // Should not be 404
      expect(response.status).not.toBe(404);
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Game Schedule Routes Smoke Tests', () => {
    it('GET /api/public/games should be reachable', async () => {
      const response = await request(app).get('/api/public/games');
      expect(response.status).not.toBe(404);
    });

    it('GET /api/games should require auth (not 404)', async () => {
      const response = await request(app).get('/api/games');
      expect(response.status).toBe(401);
    });

    it('GET /api/games/:id should require auth (not 404)', async () => {
      const response = await request(app).get('/api/games/1');
      expect(response.status).toBe(401);
    });

    it('POST /api/games/:id/attend should require auth (not 404)', async () => {
      const response = await request(app)
        .post('/api/games/1/attend')
        .send({ status: 'confirmed' });
      expect(response.status).toBe(401);
    });

    it('GET /api/games/:id/attendance should require auth (not 404)', async () => {
      const response = await request(app).get('/api/games/1/attendance');
      expect(response.status).toBe(401);
    });
  });
});
