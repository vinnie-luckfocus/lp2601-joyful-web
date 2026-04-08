/**
 * Admin Authorization Middleware Tests
 * Tests admin role verification
 * Coverage: PRD01 - Admin authorization requirements
 */

import { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../../middleware/admin';

describe('Admin Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = { user: undefined };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should call next() for admin user', () => {
    mockReq.user = { userId: '123', role: 'admin' };
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 if no user attached to request', () => {
    mockReq.user = undefined;
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 for player role', () => {
    mockReq.user = { userId: '456', role: 'player' };
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 for coach role', () => {
    mockReq.user = { userId: '789', role: 'coach' };
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 for staff role', () => {
    mockReq.user = { userId: '101', role: 'staff' };
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should handle case-sensitive role check', () => {
    mockReq.user = { userId: '112', role: 'Admin' };
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
