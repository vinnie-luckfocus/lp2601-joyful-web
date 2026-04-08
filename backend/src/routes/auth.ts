import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { generateToken, verifyToken } from '../middleware/auth';
import { comparePassword } from '../utils/password';

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

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
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as LoginRequest;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

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
