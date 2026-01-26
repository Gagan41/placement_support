const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ 
    connectionString: 'postgresql://postgres:QnSa7eOwBZ0RJCmu@db.ejyqanokuelzxbaozygb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const logRequest = (msg) => {
    console.log(msg);
    fs.appendFileSync('sql_debug_log.txt', msg + '\n');
};

async function debugQuery() {
    try {
        logRequest('Starting debug session...');
        
        logRequest('Testing simple select from integrity_logs...');
        try {
            const res1 = await pool.query('SELECT * FROM integrity_logs LIMIT 1');
            logRequest(`Simple select SUCCESS. Rows: ${res1.rows.length}`);
        } catch (e1) {
            logRequest(`Simple select FAILED: ${e1.message}`);
        }

        logRequest('Testing join with attempts...');
        try {
            const res2 = await pool.query('SELECT il.*, a.id as attempt_id_join FROM integrity_logs il JOIN attempts a ON il.attempt_id = a.id LIMIT 1');
            logRequest(`Join attempts SUCCESS. Rows: ${res2.rows.length}`);
        } catch (e2) {
            logRequest(`Join attempts FAILED: ${e2.message}`);
        }

        logRequest('Testing join with exams...');
        try {
            const res3 = await pool.query('SELECT il.*, e.title FROM integrity_logs il JOIN attempts a ON il.attempt_id = a.id JOIN exams e ON a.exam_id = e.id LIMIT 1');
            logRequest(`Join exams SUCCESS. Rows: ${res3.rows.length}`);
        } catch (e3) {
            logRequest(`Join exams FAILED: ${e3.message}`);
        }

        logRequest('Testing full query...');
        const fullQuery = `
            SELECT il.*, a.exam_id, e.title as exam_title, u.name as student_name
            FROM integrity_logs il
            JOIN attempts a ON il.attempt_id = a.id
            JOIN exams e ON a.exam_id = e.id
            JOIN users u ON a.student_id = u.id
            ORDER BY il.timestamp DESC
            LIMIT 10
        `;
        try {
            const resFull = await pool.query(fullQuery);
            logRequest(`Full query SUCCESS. Rows: ${resFull.rows.length}`);
        } catch (e4) {
            logRequest(`Full query FAILED: ${e4.message}`);
        }

    } catch (e) {
        logRequest(`Fatal Script Error: ${e.message}`);
    } finally {
        await pool.end();
        logRequest('Debug session finished.');
    }
}

debugQuery();
