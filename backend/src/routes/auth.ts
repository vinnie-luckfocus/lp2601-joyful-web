import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import pool from '../config/database';
import { generateToken, verifyToken } from '../middleware/auth';
import { comparePassword, hashPassword } from '../utils/password';

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

// Input validation schemas
const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(128),
});

const changePasswordSchema = z.object({
  old_password: z.string(),
  new_password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .refine((val) => new TextEncoder().encode(val).length <= 72, {
      message: 'Password must not exceed 72 bytes',
    }),
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
  is_first_login: boolean;
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
      'SELECT id, username, name, role, team_id, jersey_number, position, password_hash, is_first_login FROM users WHERE username = $1',
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
        team_id: user.team_id,
        role: user.role,
        is_first_login: user.is_first_login,
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

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const messages = parseResult.error.errors.map((e) => e.message).join(', ');
    res.status(400).json({ error: messages || 'Invalid input format' });
    return;
  }

  const { old_password, new_password } = parseResult.data;

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userResult = await pool.query<{ id: number; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];
    const isPasswordValid = await comparePassword(old_password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid current password' });
      return;
    }

    const newPasswordHash = await hashPassword(new_password);

    await pool.query(
      'UPDATE users SET password_hash = $1, is_first_login = false WHERE id = $2',
      [newPasswordHash, user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
