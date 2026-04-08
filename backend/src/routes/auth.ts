import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import pool from '../config/database';
import { generateToken, verifyToken } from '../middleware/auth';
import { comparePassword } from '../utils/password';

const router = Router();

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Input validation schema
const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(128),
});

interface UserRow {
  id: number;
  username: string;
  name: string;
  role: string;
  team_id: number | null;
  jersey_number: number | null;
  position: string | null;
  password_hash: string;
}

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  // Validate input with Zod
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid input format' });
    return;
  }

  const { username, password } = parseResult.data;

  try {
    const result = await pool.query<UserRow>(
      'SELECT id, username, name, role, team_id, jersey_number, position, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(String(user.id), user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (_req: Request, res: Response): void => {
  // Token invalidation happens client-side
  // Server-side token blacklisting could be implemented here if needed
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      'SELECT id, username, name, role, team_id, jersey_number, position FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      team_id: user.team_id,
      jersey_number: user.jersey_number,
      position: user.position,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
