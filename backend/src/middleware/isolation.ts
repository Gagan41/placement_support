import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';

/**
 * Middleware to ensure a user only accesses data belonging to their college.
 * Super Admins (role: 'admin') can bypass this.
 */
export const collegeIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Admins can see everything
    if (req.user.role === 'admin') {
        return next();
    }

    // Students and TPOs must have a college_id
    if (!req.user.college_id) {
        return res.status(403).json({ error: 'User is not assigned to a college' });
    }

    next();
};

/**
 * Helper to add college_id filter to SQL queries for non-admins.
 */
export const getCollegeFilter = (req: AuthRequest, tableAlias?: string) => {
    if (req.user?.role === 'admin') {
        return '';
    }
    const prefix = tableAlias ? `${tableAlias}.` : '';
    return ` AND ${prefix}college_id = '${req.user?.college_id}'`;
};
