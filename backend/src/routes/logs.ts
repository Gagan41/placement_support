import express from 'express';
import { query } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Log integrity event
router.post('/', authenticateJWT, async (req: AuthRequest, res: any) => {
    const { attempt_id, type, metadata } = req.body;
    try {
        await query(
            'INSERT INTO integrity_logs (attempt_id, type, metadata) VALUES ($1, $2, $3)',
            [attempt_id, type, JSON.stringify(metadata)]
        );
        res.status(201).json({ status: 'logged' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log integrity event' });
    }
});

// Get logs for an attempt (TPO/Admin only)
router.get('/:attemptId', authenticateJWT, async (req: AuthRequest, res: any) => {
    const { attemptId } = req.params;
    try {
        // Basic role check - TPO or Admin
        if (req.user?.role === 'student') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await query('SELECT * FROM integrity_logs WHERE attempt_id = $1', [attemptId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

export default router;
