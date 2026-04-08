import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import pool from '../../config/database';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin);

// GET /api/admin/dashboard - Admin dashboard
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, role, team_id FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
