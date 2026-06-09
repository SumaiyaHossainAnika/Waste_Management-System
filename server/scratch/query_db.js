const pool = require('../src/config/db');

(async () => {
  try {
    const locations = await pool.query('SELECT * FROM locations');
    console.log('Locations:');
    console.log(locations.rows);

    const users = await pool.query('SELECT id, email, role, assigned_location_id, full_name FROM users');
    console.log('Users:');
    console.log(users.rows);

    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    await pool.end();
  }
})();
