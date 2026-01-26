const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:QnSa7eOwBZ0RJCmu@db.ejyqanokuelzxbaozygb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function findTables() {
    try {
        console.log('Checking for relevant tables...');
        const res = await pool.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('integrity_logs', 'attempts', 'exams', 'users')
        `);
        console.log('Found tables:', res.rows.map(r => r.tablename));
        
        if (res.rows.length < 4) {
            console.log('MISSING TABLES detected!');
        }

        for (const row of res.rows) {
            const cols = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${row.tablename}'
            `);
            console.log(`Columns in ${row.tablename}:`, cols.rows.map(c => c.column_name));
        }

    } catch (e) {
        console.error('Diagnostic error:', e.message);
    } finally {
        await pool.end();
    }
}

findTables();
