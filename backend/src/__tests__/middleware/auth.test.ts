/**
 * Authentication Middleware Tests
 * Tests JWT token generation and verification
 * Coverage: PRD01 - Authentication requirements
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../middleware/auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken('123', 'admin');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token with correct payload', () => {
      const token = generateToken('456', 'player');
      const decoded = jwt.decode(token) as { userId: string; role: string };
      expect(decoded.userId).toBe('456');
      expect(decoded.role).toBe('player');
    });

    it('should generate token with expiration', () => {
      const token = generateToken('123', 'admin');
      const decoded = jwt.decode(token) as { exp: number };
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('verifyToken', () => {
    it('should call next() for valid token', () => {
      const token = generateToken('123', 'admin');
      mockReq.headers = { authorization: `Bearer ${token}` };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should attach user data to request for valid token', () => {
      const token = generateToken('789', 'player');
      mockReq.headers = { authorization: `Bearer ${token}` };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('789');
      expect(mockReq.user?.role).toBe('player');
    });

    it('should return 401 if no authorization header', () => {
      mockReq.headers = {};
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic abc123' };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should return 401 for invalid token format', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return 401 for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123', role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );
      mockReq.headers = { authorization: `Bearer ${expiredToken}` };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return 401 for token with wrong signature', () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: '123', role: 'admin' },
        'wrong-secret'
      );
      mockReq.headers = { authorization: `Bearer ${tokenWithWrongSecret}` };
      verifyToken(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });
});
