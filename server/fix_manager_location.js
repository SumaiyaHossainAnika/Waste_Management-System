const pool = require('./src/config/db');

(async () => {
  try {
    // Assign existing managers to Hitech zone (location_id = 2)
    await pool.query('UPDATE users SET assigned_location_id = 2 WHERE role = $1 AND assigned_location_id IS NULL', ['manager']);
    
    const result = await pool.query('SELECT email, role, assigned_location_id FROM users WHERE role = $1', ['manager']);
    console.log('✓ Updated managers:');
    result.rows.forEach(row => {
      console.log(`  - ${row.email}: location_id = ${row.assigned_location_id}`);
    });
    
    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    await pool.end();
    process.exit(1);
  }
})();
