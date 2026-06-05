const pool = require('./src/config/db');

(async () => {
  try {
    const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'heatmap_data' ORDER BY ordinal_position");
    console.log('heatmap_data columns:', result.rows.map(r => r.column_name));
    
    const result2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'dumping_hotspots' ORDER BY ordinal_position");
    console.log('dumping_hotspots columns:', result2.rows.map(r => r.column_name));
    
    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    await pool.end();
  }
})();
