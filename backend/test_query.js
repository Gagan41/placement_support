const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:QnSa7eOwBZ0RJCmu@db.ejyqanokuelzxbaozygb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function runDiagnostics() {
    try {
        console.log('Testing connection...');
        await pool.query('SELECT 1');
        console.log('Connection OK');

        console.log('Testing integrity_logs access...');
        const il = await pool.query('SELECT COUNT(*) FROM integrity_logs');
        console.log('integrity_logs count:', il.rows[0].count);

        console.log('Testing attempts access...');
        const attempts = await pool.query('SELECT COUNT(*) FROM attempts');
        console.log('attempts count:', attempts.rows[0].count);

        console.log('Testing full join query...');
        const query = `
            SELECT il.*, a.exam_id, e.title as exam_title, u.name as student_name
            FROM integrity_logs il
            JOIN attempts a ON il.attempt_id = a.id
            JOIN exams e ON a.exam_id = e.id
            JOIN users u ON a.student_id = u.id
            ORDER BY il.timestamp DESC
            LIMIT 10
        `;
        const start = Date.now();
        const result = await pool.query(query);
        const end = Date.now();
        console.log('Full query success:', result.rows.length, 'rows in', end - start, 'ms');

    } catch (e) {
        console.error('Diagnostic failed:', e.message);
        if (e.stack) console.error(e.stack);
    } finally {
        await pool.end();
    }
}

runDiagnostics();
