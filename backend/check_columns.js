const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:QnSa7eOwBZ0RJCmu@db.ejyqanokuelzxbaozygb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'integrity_logs'
        `);
        console.log('integrity_logs columns:', res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
