process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = require('./src/config/db');

(async () => {
  try {
    console.log('[Migration] Adding location_id to heatmap tables...');
    
    // Add location_id to heatmap_data
    await pool.query(`
      ALTER TABLE heatmap_data 
      ADD COLUMN location_id INT REFERENCES locations(id) ON DELETE SET NULL
    `);
    console.log('✓ Added location_id to heatmap_data');
    
    // Add location_id to dumping_hotspots
    await pool.query(`
      ALTER TABLE dumping_hotspots 
      ADD COLUMN location_id INT REFERENCES locations(id) ON DELETE SET NULL
    `);
    console.log('✓ Added location_id to dumping_hotspots');
    
    // Assign all existing heatmap_data to Hitech zone (location_id = 2)
    await pool.query(`
      UPDATE heatmap_data SET location_id = 2 WHERE location_id IS NULL
    `);
    console.log('✓ Assigned heatmap_data to Hitech zone');
    
    // Assign all existing dumping_hotspots to Hitech zone (location_id = 2)
    await pool.query(`
      UPDATE dumping_hotspots SET location_id = 2 WHERE location_id IS NULL
    `);
    console.log('✓ Assigned dumping_hotspots to Hitech zone');
    
    // Verify
    const heatmapCount = await pool.query('SELECT COUNT(*) FROM heatmap_data WHERE location_id = 2');
    const hotspotsCount = await pool.query('SELECT COUNT(*) FROM dumping_hotspots WHERE location_id = 2');
    
    console.log(`\n✅ Migration complete!`);
    console.log(`  - Heatmap points in Hitech: ${heatmapCount.rows[0].count}`);
    console.log(`  - Dumping hotspots in Hitech: ${hotspotsCount.rows[0].count}`);
    
    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    await pool.end();
    process.exit(1);
  }
})();
