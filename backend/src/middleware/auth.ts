import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtUserPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}
