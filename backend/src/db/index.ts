import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
