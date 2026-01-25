import express from 'express';
import { query } from '../db';
import { authenticateJWT, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Student: Get their own attempts and scores
router.get('/student/my-scores', authenticateJWT, authorizeRoles('student'), async (req: AuthRequest, res: any) => {
    try {
        const result = await query(`
            SELECT a.*, e.title as exam_title, e.duration
            FROM attempts a
            JOIN exams e ON a.exam_id = e.id
            WHERE a.student_id = $1
            ORDER BY a.submitted_at DESC
        `, [req.user?.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

// TPO: Get participation stats for an exam
router.get('/tpo/exam-stats/:examId', authenticateJWT, authorizeRoles('tpo'), async (req: AuthRequest, res: any) => {
    const { examId } = req.params;
    try {
        // Verify exam belongs to TPO's college
        const examCheck = await query('SELECT id FROM exams WHERE id = $1 AND college_id = $2', [examId, req.user?.college_id]);
        if (examCheck.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

        const attempts = await query(`
            SELECT a.*, u.name as student_name, u.email as student_email
            FROM attempts a
            JOIN users u ON a.student_id = u.id
            WHERE a.exam_id = $1
            ORDER BY a.score DESC
        `, [examId]);

        res.json({
            exam_id: examId,
            total_attempts: attempts.rows.length,
            results: attempts.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exam stats' });
    }
});

export default router;
