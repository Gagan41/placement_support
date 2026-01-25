import express from 'express';
import { query } from '../db';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public: Get active colleges for signup
router.get('/', async (req, res) => {
    try {
        const result = await query("SELECT id, name FROM colleges WHERE status = 'active' ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch colleges' });
    }
});

// Admin: Add a college
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    const { name } = req.body;
    try {
        const result = await query("INSERT INTO colleges (name) VALUES ($1) RETURNING *", [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create college' });
    }
});

export default router;
