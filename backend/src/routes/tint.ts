import express from 'express';
import { query } from '../db';
import { authenticateJWT, AuthRequest, authorizeRoles } from '../middleware/auth';
import { collegeIsolation } from '../middleware/isolation';

const router = express.Router();

// Get TINT materials
router.get('/', authenticateJWT, collegeIsolation, async (req: AuthRequest, res: any) => {
    try {
        let sql = 'SELECT * FROM tint_materials WHERE 1=1';
        const params: any[] = [];

        if (req.user?.role !== 'admin') {
            sql += ' AND college_id = $1';
            params.push(req.user?.college_id);
        }

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

// Upload TINT material (TPO only)
router.post('/', authenticateJWT, authorizeRoles('tpo'), async (req: AuthRequest, res: any) => {
    const { title, category, file_url } = req.body;
    try {
        const result = await query(
            'INSERT INTO tint_materials (title, category, file_url, college_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, category, file_url, req.user?.college_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload material' });
    }
});

export default router;
