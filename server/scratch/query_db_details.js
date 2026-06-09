const pool = require('../src/config/db');

(async () => {
  try {
    const bins = await pool.query('SELECT * FROM waste_bins WHERE location_id = 1');
    console.log('Bins for Location 1:');
    console.log(bins.rows);

    const vehicles = await pool.query('SELECT vehicle_type, plate_number, capacity_tons, trips_per_day, count(*) FROM vehicles WHERE location_id = 1 GROUP BY vehicle_type, plate_number, capacity_tons, trips_per_day');
    console.log('Vehicles for Location 1 counts:', vehicles.rows.length);

    const roadSegments = await pool.query('SELECT * FROM road_segments WHERE location_id = 1');
    console.log('Road segments for Location 1:');
    console.log(roadSegments.rows);

    const hotspots = await pool.query('SELECT * FROM dumping_hotspots WHERE location_id = 1');
    console.log('Dumping hotspots for Location 1:');
    console.log(hotspots.rows);

    const heatmaps = await pool.query('SELECT * FROM heatmap_data WHERE location_id = 1');
    console.log('Heatmaps for Location 1:');
    console.log(heatmaps.rows);

    await pool.end();
  } catch(e) {
    console.error('Error:', e.message);
    await pool.end();
  }
})();
