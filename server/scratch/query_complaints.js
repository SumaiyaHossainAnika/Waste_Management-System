const pool = require('../src/config/db');

async function checkComplaints() {
  try {
    const res = await pool.query('SELECT id, title, photo_url FROM complaints ORDER BY created_at DESC LIMIT 10');
    console.log('--- COMPLAINTS ---');
    console.table(res.rows);
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkComplaints();
