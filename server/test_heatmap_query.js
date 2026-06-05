const pool = require('./src/config/db');

(async () => {
  try {
    console.log('[Test] Running heatmap query for location_id = 2...');
    
    // Test the exact query from the controller
    const type = 'waste_concentration';
    const userLocationId = 2;
    
    let query = 'SELECT latitude, longitude, intensity FROM heatmap_data WHERE data_type = $1';
    const params = [type];
    
    if (userLocationId) {
      query += ' AND location_id = $2';
      params.push(userLocationId);
    }
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await pool.query(query, params);
    console.log(`✓ Query successful! Found ${result.rows.length} heatmap points`);
    console.log('Sample:', result.rows.slice(0, 2));
    
    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Full error:', e);
    await pool.end();
  }
})();
