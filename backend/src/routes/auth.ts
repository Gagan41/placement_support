import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// SIGNUP
router.post('/signup', async (req: any, res: any) => {
  let { name, email, password, role, college_id } = req.body;
  email = email?.trim().toLowerCase();

  try {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role, college_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, college_id',
      [name, email, hashedPassword, role, college_id || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, college_id: user.college_id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// LOGIN
router.post('/login', async (req: any, res: any) => {
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, college_id: user.college_id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, college_id: user.college_id },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ADMIN: List users by role
router.get('/users', authenticateJWT, authorizeRoles('admin'), async (req: any, res: any) => {
  const { role } = req.query;
  try {
    const result = await query('SELECT id, name, email, role, college_id FROM users WHERE role = $1', [role]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
