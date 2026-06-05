const pool = require('../config/db');
const axios = require('axios');

const ROAD_WIDTH_THRESHOLDS = {
  truck: 7.0,
  mini_truck: 5.0,
  rickshaw_van: 3.0,
};

const ROAD_TYPE_WIDTHS = {
  motorway: 12.0, trunk: 10.0, primary: 8.0, secondary: 6.5,
  tertiary: 5.0, residential: 4.0, service: 3.5, unclassified: 3.5,
  living_street: 3.0, pedestrian: 2.5, footway: 1.5, path: 1.0,
};

function recommendVehicle(widthMeters) {
  if (widthMeters >= ROAD_WIDTH_THRESHOLDS.truck) return 'truck';
  if (widthMeters >= ROAD_WIDTH_THRESHOLDS.mini_truck) return 'mini_truck';
  if (widthMeters >= ROAD_WIDTH_THRESHOLDS.rickshaw_van) return 'rickshaw_van';
  return 'manual_collection';
}

exports.analyzeRoad = async (req, res) => {
  try {
    const { start_lat, start_lng, end_lat, end_lng } = req.body;
    const midLat = (start_lat + end_lat) / 2;
    const midLng = (start_lng + end_lng) / 2;
    const radius = 50;
    const overpassQuery = `[out:json][timeout:10];way(around:${radius},${midLat},${midLng})["highway"];out body;`;
    let roadData = { width: null, roadType: 'unclassified', name: 'Unknown Road' };
    try {
      const response = await axios.get('https://overpass-api.de/api/interpreter', { params: { data: overpassQuery }, timeout: 10000 });
      if (response.data && response.data.elements && response.data.elements.length > 0) {
        const road = response.data.elements[0];
        roadData.name = road.tags?.name || 'Unnamed Road';
        roadData.roadType = road.tags?.highway || 'unclassified';
        if (road.tags?.width) {
          roadData.width = parseFloat(road.tags.width);
        } else if (road.tags?.lanes) {
          roadData.width = parseInt(road.tags.lanes) * 3.5;
        } else {
          roadData.width = ROAD_TYPE_WIDTHS[roadData.roadType] || 3.5;
        }
      }
    } catch (apiErr) {
      roadData.width = ROAD_TYPE_WIDTHS[roadData.roadType] || 3.5;
    }
    const recommended = recommendVehicle(roadData.width);
    res.json({ road: { ...roadData, width_meters: roadData.width, recommended_vehicle: recommended, start_lat, start_lng, end_lat, end_lng } });
  } catch (err) {
    console.error('[Road] Analyze error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.save = async (req, res) => {
  try {
    const { name, start_lat, start_lng, end_lat, end_lng, width_meters, road_type, recommended_vehicle, notes } = req.body;
    const locationId = req.body.location_id || req.userLocationId || null;
    const result = await pool.query(
      'INSERT INTO road_segments (name, start_lat, start_lng, end_lat, end_lng, width_meters, road_type, recommended_vehicle, notes, location_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [name, start_lat, start_lng, end_lat, end_lng, width_meters, road_type, recommended_vehicle, notes, locationId]
    );
    res.status(201).json({ road: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
};

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM road_segments ORDER BY created_at DESC');
    res.json({ roads: result.rows });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
};

exports.getRecommendation = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM road_segments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Road not found.' });
    const road = result.rows[0];
    res.json({ road, recommendation: { vehicle: road.recommended_vehicle, width: road.width_meters, reason: `Road width ${road.width_meters}m - ${road.recommended_vehicle === 'truck' ? 'Wide enough for truck operations' : road.recommended_vehicle === 'mini_truck' ? 'Suitable for mini trucks only' : road.recommended_vehicle === 'rickshaw_van' ? 'Narrow road, use rickshaw vans' : 'Too narrow for vehicles, manual collection needed'}` } });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
};
