const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seed() {
  try {
    console.log('Seeding default users...');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('1234', salt);

    // Manager (Karim)
    const managerExist = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['karim@gmail.com']);
    if (managerExist.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role, assigned_location_id) VALUES ($1, $2, $3, $4, 2)',
        ['karim@gmail.com', hash, 'Karim', 'manager']
      );
      console.log('✓ Created Manager: karim@gmail.com / 1234');
    } else {
      console.log('Manager already exists.');
    }

    // Manager (Helal)
    const helalExist = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['helal@gmail.com']);
    if (helalExist.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role, assigned_location_id) VALUES ($1, $2, $3, $4, 1)',
        ['helal@gmail.com', hash, 'Helal', 'manager']
      );
      console.log('✓ Created Manager: helal@gmail.com / 1234');
    } else {
      console.log('Helal Manager already exists.');
    }

    // Citizen
    const citizenExist = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['citizen@gmail.com']);
    if (citizenExist.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        ['citizen@gmail.com', hash, 'Citizen User', 'citizen']
      );
      console.log('✓ Created Citizen: citizen@gmail.com / 1234');
    } else {
      console.log('Citizen already exists.');
    }

    const rahimExist = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['rahim@gmail.com']);
    if (rahimExist.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        ['rahim@gmail.com', hash, 'Rahim Citizen', 'citizen']
      );
      console.log('✓ Created Rahim Citizen: rahim@gmail.com / 1234');
    } else {
      console.log('Rahim Citizen already exists.');
    }

    await pool.end();
  } catch (err) {
    console.error('Error seeding users:', err);
    await pool.end();
  }
}

seed();
