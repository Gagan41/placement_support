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
            ORDER BY il.created_at DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Integrity Logs Error:', err);
        res.status(500).json({ error: 'Failed to fetch global logs' });
    }
});

// Get comprehensive analytics
router.get('/analytics', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        // Daily registrations (last 30 days)
        const registrations = await query(`
            SELECT date_trunc('day', created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at > now() - interval '30 days'
            GROUP BY date
            ORDER BY date ASC
        `);

        // Daily exam attempts (last 30 days)
        const attempts = await query(`
            SELECT date_trunc('day', submitted_at) as date, COUNT(*) as count
            FROM attempts
            WHERE submitted_at > now() - interval '30 days'
            GROUP BY date
            ORDER BY date ASC
        `);

        // Role distribution
        const roles = await query(`
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        `);

        // Integrity issue breakdown
        const integrityDist = await query(`
            SELECT type, COUNT(*) as count
            FROM integrity_logs
            GROUP BY type
        `);

        res.json({
            registrations: registrations.rows,
            attempts: attempts.rows,
            roles: roles.rows,
            integrityDistribution: integrityDist.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

export default router;
