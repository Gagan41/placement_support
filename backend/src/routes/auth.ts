import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { generateOTP, hashOTP } from '../utils/otp';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/mailer';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/* ======================================================
   GLOBAL OTP LOCK CHECK
====================================================== */
async function getOtpLockRemaining(userId: string): Promise<number | null> {
  const r = await query(
    'SELECT locked_until FROM users WHERE id = $1',
    [userId]
  );

  const lockedUntil = r.rows[0]?.locked_until;
  if (lockedUntil && new Date(lockedUntil).getTime() > Date.now()) {
    return Math.ceil(
      (new Date(lockedUntil).getTime() - Date.now()) / 1000
    );
  }
  return null;
}

/* ======================================================
   SIGNUP
====================================================== */
router.post('/signup', async (req, res) => {
  let { name, email, password, role, college_id } = req.body;
  email = email?.trim().toLowerCase();

  if (!['student', 'tpo'].includes(role)) {
    return res.status(403).json({ error: 'Invalid role' });
  }

  try {
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, college_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, college_id`,
      [name, email, hash, role, college_id || null]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch {
    res.status(500).json({ error: 'Signup failed' });
  }
});

/* ======================================================
   LOGIN → SEND OTP
====================================================== */
router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();

  try {
    const r = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!r.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = r.rows[0];

    if (!(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const lockRemaining = await getOtpLockRemaining(user.id);
    if (lockRemaining) {
      return res.status(429).json({
        error: 'Too many OTP attempts',
        retry_after_seconds: lockRemaining
      });
    }

    const lastOtp = await query(
      `SELECT created_at FROM login_otps
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (lastOtp.rows.length) {
      const diff = Date.now() - new Date(lastOtp.rows[0].created_at).getTime();
      if (diff < 15000) {
        return res.status(429).json({
          error: 'Please wait before requesting OTP',
          retry_after_seconds: Math.ceil((15000 - diff) / 1000)
        });
      }
    }

    await query('UPDATE login_otps SET used = true WHERE user_id = $1', [user.id]);

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpRes = await query(
      `INSERT INTO login_otps (user_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [user.id, otpHash, expiresAt]
    );

    sendOTPEmail(user.email, otp).catch(console.error);

    res.json({ status: 'OTP_REQUIRED', otpId: otpRes.rows[0].id });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ======================================================
   VERIFY LOGIN OTP
====================================================== */
router.post('/verify-otp', async (req, res) => {
  const { otpId, otp } = req.body;

  try {
    const r = await query('SELECT * FROM login_otps WHERE id = $1', [otpId]);
    if (!r.rows.length) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const record = r.rows[0];

    const lockRemaining = await getOtpLockRemaining(record.user_id);
    if (lockRemaining) {
      return res.status(429).json({
        error: 'Too many OTP attempts',
        retry_after_seconds: lockRemaining
      });
    }

    if (record.used) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ error: 'OTP expired' });
    }

    if (hashOTP(otp) !== record.otp_hash) {
      const f = await query(
        `UPDATE users
         SET failed_login_attempts = failed_login_attempts + 1
         WHERE id = $1
         RETURNING failed_login_attempts`,
        [record.user_id]
      );

      if (f.rows[0].failed_login_attempts >= 3) {
        await query(
          `UPDATE users
           SET locked_until = NOW() + INTERVAL '15 minutes'
           WHERE id = $1`,
          [record.user_id]
        );

        return res.status(429).json({
          error: 'Too many wrong OTP attempts',
          retry_after_seconds: 15 * 60
        });
      }

      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await query('UPDATE login_otps SET used = true WHERE id = $1', [otpId]);

    await query(
      `UPDATE users
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW()
       WHERE id = $1`,
      [record.user_id]
    );

    const u = await query(
      'SELECT id, name, email, role, college_id FROM users WHERE id = $1',
      [record.user_id]
    );

    const token = jwt.sign(
      { id: u.rows[0].id, role: u.rows[0].role, college_id: u.rows[0].college_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user: u.rows[0], token });
  } catch {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

export default router;
