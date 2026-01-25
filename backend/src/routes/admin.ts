import express from 'express';
import { query } from '../db';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get global stats
router.get('/stats', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        const colleges = await query('SELECT COUNT(*) FROM colleges');
        const users = await query('SELECT COUNT(*) FROM users');
        const exams = await query('SELECT COUNT(*) FROM exams');
        const attempts = await query('SELECT COUNT(*) FROM attempts');

        res.json({
            colleges: colleges.rows[0].count,
            users: users.rows[0].count,
            exams: exams.rows[0].count,
            attempts: attempts.rows[0].count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
});

// Get global integrity logs
router.get('/integrity-logs', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await query(`
            SELECT il.*, a.exam_id, e.title as exam_title, u.name as student_name
            FROM integrity_logs il
            JOIN attempts a ON il.attempt_id = a.id
            JOIN exams e ON a.exam_id = e.id
            JOIN users u ON a.student_id = u.id
            ORDER BY il.timestamp DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch global logs' });
    }
});

export default router;
