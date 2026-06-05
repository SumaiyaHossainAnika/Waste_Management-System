const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = 'SELECT c.*, u.full_name as reporter_name, u.email as reporter_email FROM complaints c LEFT JOIN users u ON c.user_id = u.id';
    let conditions = [];
    let params = [];
    let idx = 1;

    if (req.user.role === 'citizen') {
      conditions.push(`c.user_id = $${idx++}`);
      params.push(req.user.id);
    } else if (req.user.role === 'manager' && req.userLocationId) {
      conditions.push(`(
        SELECT l.wards && (SELECT wards FROM locations WHERE id = $${idx++})
        FROM locations l 
        ORDER BY (c.latitude - l.latitude) * (c.latitude - l.latitude) + (c.longitude - l.longitude) * (c.longitude - l.longitude) ASC 
        LIMIT 1
      ) = true`);
      params.push(req.userLocationId);
    }
    if (status) { conditions.push(`c.status = $${idx++}`); params.push(status); }
    if (category) { conditions.push(`c.category = $${idx++}`); params.push(category); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ complaints: result.rows });
  } catch (err) {
    console.error('[Complaint] GetAll error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, latitude, longitude, address, category, severity } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO complaints (user_id, title, description, latitude, longitude, address, photo_url, category, severity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, title, description, latitude, longitude, address, photo_url, category, severity || 'medium']
    );
    res.status(201).json({ complaint: result.rows[0] });
  } catch (err) {
    console.error('[Complaint] Create error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, assigned_to } = req.body;
    const resolved_at = status === 'resolved' ? new Date() : null;
    const result = await pool.query(
      'UPDATE complaints SET status=$1, assigned_to=$2, resolved_at=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [status, assigned_to, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Complaint not found.' });
    res.json({ complaint: result.rows[0] });
  } catch (err) {
    console.error('[Complaint] UpdateStatus error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, u.full_name as reporter_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Complaint not found.' });
    res.json({ complaint: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
