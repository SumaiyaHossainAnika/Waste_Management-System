const pool = require('../config/db');
const { haversineDistance } = require('../utils/haversine');
const { buildGraph } = require('../utils/graphBuilder');
const dijkstra = require('../algorithms/dijkstra');
const aStar = require('../algorithms/aStar');
const tsp = require('../algorithms/tsp');
const vrp = require('../algorithms/vrp');

exports.optimize = async (req, res) => {
  try {
    const { algorithm, target_type, location_id, bin_ids, vehicle_count, start_lat, start_lng } = req.body;
    let nodes = [];
    const start = { lat: start_lat || 23.828969, lng: start_lng || 90.365585 };

    if (target_type === 'locations') {
      const locationsResult = await pool.query("SELECT * FROM locations WHERE status = 'active'");
      const locations = locationsResult.rows;
      if (locations.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 active locations for optimization.' });
      }
      nodes = [
        { id: 'start', lat: start.lat, lng: start.lng },
        ...locations.map(l => ({ id: l.id, lat: parseFloat(l.latitude), lng: parseFloat(l.longitude), name: l.name }))
      ];
    } else {
      // Default to bins
      let binsQuery = 'SELECT * FROM waste_bins WHERE status = $1';
      let params = ['active'];
      if (location_id) { binsQuery += ' AND location_id = $2'; params.push(location_id); }
      const binsResult = await pool.query(binsQuery, params);
      let bins = binsResult.rows;
      if (bin_ids && bin_ids.length > 0) bins = bins.filter(b => bin_ids.includes(b.id));
      if (bins.length < 2) {
        return res.status(400).json({ error: 'Selected location needs at least 2 active waste bins.' });
      }
      nodes = [
        { id: 'start', lat: start.lat, lng: start.lng },
        ...bins.map(b => ({ id: b.id, lat: parseFloat(b.latitude), lng: parseFloat(b.longitude), name: b.bin_code }))
      ];
    }

    const graph = buildGraph(nodes);
    let result;
    switch (algorithm) {
      case 'dijkstra': result = dijkstra(graph, 'start', nodes[nodes.length - 1].id); break;
      case 'a_star': result = aStar(graph, nodes, 'start', nodes[nodes.length - 1].id); break;
      case 'tsp': result = tsp(graph, nodes); break;
      case 'vrp': result = vrp(graph, nodes, vehicle_count || 2); break;
      default: return res.status(400).json({ error: 'Invalid algorithm.' });
    }
    const waypoints = result.path.map(nodeId => {
      const node = nodes.find(n => String(n.id) === String(nodeId));
      return node ? { lat: node.lat, lng: node.lng, id: node.id } : null;
    }).filter(Boolean);
    const saved = await pool.query(
      `INSERT INTO optimized_routes (name, location_id, algorithm, waypoints, total_distance_km, estimated_time_minutes, vehicle_count, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [`Route ${algorithm.toUpperCase()} - ${new Date().toLocaleDateString()}`, target_type === 'locations' ? null : (location_id || null), algorithm, JSON.stringify(waypoints), result.totalDistance, Math.round(result.totalDistance / 30 * 60), vehicle_count || 1, req.user.id]
    );
    res.json({ route: saved.rows[0], optimization: result });
  } catch (err) {
    console.error('[Route] Optimize error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM optimized_routes ORDER BY created_at DESC');
    res.json({ routes: result.rows });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
};

exports.activate = async (req, res) => {
  try {
    await pool.query('UPDATE optimized_routes SET is_active = false WHERE location_id = (SELECT location_id FROM optimized_routes WHERE id = $1)', [req.params.id]);
    const result = await pool.query('UPDATE optimized_routes SET is_active = true WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found.' });
    res.json({ route: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
};
