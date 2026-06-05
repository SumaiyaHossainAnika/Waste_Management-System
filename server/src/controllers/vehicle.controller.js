const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { location_id } = req.query;
    let query = 'SELECT * FROM vehicles';
    let params = [];
    if (location_id) {
      query += ' WHERE location_id = $1';
      params.push(location_id);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ vehicles: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { location_id, vehicle_type, plate_number, capacity_tons, trips_per_day } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [location_id, vehicle_type, plate_number, capacity_tons, trips_per_day]
    );
    res.status(201).json({ vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { vehicle_type, plate_number, capacity_tons, trips_per_day, status } = req.body;
    const result = await pool.query(
      'UPDATE vehicles SET vehicle_type=$1, plate_number=$2, capacity_tons=$3, trips_per_day=$4, status=$5 WHERE id=$6 RETURNING *',
      [vehicle_type, plate_number, capacity_tons, trips_per_day, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
