const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:QnSa7eOwBZ0RJCmu@db.ejyqanokuelzxbaozygb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        const tables = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log('--- TABLES ---');
        for (const r of tables.rows) {
            console.log(r.tablename);
        }
        console.log('--- END TABLES ---');

        for (const r of tables.rows) {
            const table = r.tablename;
            const columns = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`--- COLUMNS IN ${table} ---`);
            for (const c of columns.rows) {
                console.log(c.column_name);
            }
        }
    } catch (e) {
        console.error('Schema check failed:', e.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
