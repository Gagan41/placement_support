import express from 'express';
import { query } from '../db';
import { authenticateJWT, AuthRequest, authorizeRoles } from '../middleware/auth';
import { collegeIsolation } from '../middleware/isolation';

const router = express.Router();

// Get all exams for the user's college
router.get('/', authenticateJWT, collegeIsolation, async (req: AuthRequest, res: any) => {
    try {
        let sql = 'SELECT * FROM exams WHERE 1=1';
        const params: any[] = [];

        if (req.user?.role !== 'admin') {
            sql += ' AND college_id = $1';
            params.push(req.user?.college_id);
        }

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get questions for an exam
router.get('/:examId/questions', authenticateJWT, collegeIsolation, async (req: AuthRequest, res: any) => {
    const { examId } = req.params;
    try {
        // Verify exam belongs to user's college
        if (req.user?.role !== 'admin') {
            const check = await query('SELECT id FROM exams WHERE id = $1 AND college_id = $2', [examId, req.user?.college_id]);
            if (check.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query('SELECT id, question, options FROM questions WHERE exam_id = $1', [examId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Create an exam (TPO only)
router.post('/', authenticateJWT, authorizeRoles('tpo'), async (req: AuthRequest, res: any) => {
    const { title, duration } = req.body;
    try {
        const result = await query(
            'INSERT INTO exams (title, duration, college_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, duration, req.user?.college_id, req.user?.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

// Add questions to exam (TPO only)
router.post('/:examId/questions', authenticateJWT, authorizeRoles('tpo'), async (req: AuthRequest, res: any) => {
    const { examId } = req.params;
    const { questions } = req.body; // Array of { question, options, correct_answer }

    try {
        // Verify exam belongs to the TPO's college
        const examCheck = await query('SELECT id FROM exams WHERE id = $1 AND college_id = $2', [examId, req.user?.college_id]);
        if (examCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized or Exam not found' });
        }

        const values = questions.map((q: any) => `('${examId}', '${q.question}', '${JSON.stringify(q.options)}', '${q.correct_answer}')`).join(',');
        await query(`INSERT INTO questions (exam_id, question, options, correct_answer) VALUES ${values}`);

        res.status(201).json({ message: 'Questions added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add questions' });
    }
});

// Submit exam attempt (Student only)
router.post('/:examId/attempt', authenticateJWT, authorizeRoles('student'), async (req: AuthRequest, res: any) => {
    const { examId } = req.params;
    const { answers } = req.body; // Map of { questionId: answer }

    try {
        // Fetch correct answers
        const questions = await query('SELECT id, correct_answer FROM questions WHERE exam_id = $1', [examId]);
        let score = 0;
        questions.rows.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score++;
            }
        });

        const attempt = await query(
            'INSERT INTO attempts (exam_id, student_id, score) VALUES ($1, $2, $3) RETURNING *',
            [examId, req.user?.id, score]
        );

        res.status(201).json(attempt.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit attempt' });
    }
});

export default router;
