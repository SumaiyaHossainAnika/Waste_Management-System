const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/ecoroute'
});

pool.query('SELECT current_database(), current_user')
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });