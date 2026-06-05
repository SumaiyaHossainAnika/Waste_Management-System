const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { location_id } = req.query;
    let query = 'SELECT * FROM employees';
    let params = [];
    if (location_id) { query += ' WHERE location_id = $1'; params.push(location_id); }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ employees: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { location_id, name, role, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO employees (location_id, name, role, phone) VALUES ($1,$2,$3,$4) RETURNING *',
      [location_id, name, role, phone]
    );
    res.status(201).json({ employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, role, phone, status } = req.body;
    const result = await pool.query(
      'UPDATE employees SET name=$1, role=$2, phone=$3, status=$4 WHERE id=$5 RETURNING *',
      [name, role, phone, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
