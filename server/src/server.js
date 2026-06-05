const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] EcoRoute API running on port ${PORT}`);
  
  // Test database connection asynchronously
  pool.query('SELECT NOW()')
    .then(() => console.log('[Server] Database connected successfully'))
    .catch(err => console.error('[Server] Database connection error:', err.message));
});
