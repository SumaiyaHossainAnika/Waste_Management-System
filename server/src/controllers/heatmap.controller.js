const pool = require('../config/db');

exports.getHeatmapData = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['waste_concentration', 'complaint_density', 'collection_frequency'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid heatmap type.' });
    }
    
    // Build location filter
    let query = 'SELECT latitude, longitude, intensity FROM heatmap_data WHERE data_type = $1';
    const params = [type];
    
    // Managers see only their zone's locations
    if (req.userLocationId) {
      const managerLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [req.userLocationId]);
      if (managerLocRes.rows.length > 0 && managerLocRes.rows[0].wards) {
        const wards = managerLocRes.rows[0].wards;
        query += ' AND location_id IN (SELECT id FROM locations WHERE id = $2 OR wards && $3)';
        params.push(req.userLocationId, wards);
      } else {
        query += ' AND location_id = $2';
        params.push(req.userLocationId);
      }
    }
    
    const result = await pool.query(query, params);
    // Format for leaflet.heat: [[lat, lng, intensity], ...]
    const heatData = result.rows.map(r => [parseFloat(r.latitude), parseFloat(r.longitude), parseFloat(r.intensity)]);
    res.json({ heatmap: heatData, type });
  } catch (err) {
    console.error('[Heatmap] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getHotspots = async (req, res) => {
  try {
    // Build location filter
    let query = 'SELECT * FROM dumping_hotspots';
    const params = [];
    
    // Managers see only hotspots in their zone
    if (req.userLocationId) {
      const managerLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [req.userLocationId]);
      if (managerLocRes.rows.length > 0 && managerLocRes.rows[0].wards) {
        const wards = managerLocRes.rows[0].wards;
        query += ' WHERE location_id IN (SELECT id FROM locations WHERE id = $1 OR wards && $2)';
        params.push(req.userLocationId, wards);
      } else {
        query += ' WHERE location_id = $1';
        params.push(req.userLocationId);
      }
    }
    
    query += ' ORDER BY severity DESC, reported_count DESC';
    const result = await pool.query(query, params);
    res.json({ hotspots: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
