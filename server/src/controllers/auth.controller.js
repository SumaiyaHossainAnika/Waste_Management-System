const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      assigned_location_id: user.assigned_location_id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};
exports.signup = async (req, res) => {
  try {
    const { email, password, full_name, role, phone } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!['manager', 'citizen'].includes(role)) {
      return res.status(400).json({ error: 'Role must be manager or citizen.' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role, phone, assigned_location_id) VALUES ($1, $2, $3, $4, $5, (SELECT id FROM locations WHERE name = $6 LIMIT 1)) RETURNING id, email, full_name, role, phone, assigned_location_id, created_at',
      [email, password_hash, full_name, role, phone || null, 'Dakshin Kafrul']
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(email) = LOWER($1 || \'@gmail.com\')',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = generateToken(user);
    const { password_hash, ...userData } = user;
    // Include location info for managers
    if (userData.role === 'manager' && userData.assigned_location_id) {
      const locResult = await pool.query('SELECT id, name, covered_area, wards, total_employees, daily_load_tons FROM locations WHERE id = $1', [userData.assigned_location_id]);
      if (locResult.rows.length > 0) {
        userData.assignedLocation = locResult.rows[0];
      }
    }
    res.json({ user: userData, token });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, phone, avatar_url, assigned_location_id, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = result.rows[0];
    // Include location info for managers
    if (user.role === 'manager' && user.assigned_location_id) {
      const locResult = await pool.query('SELECT id, name, covered_area, wards, total_employees, daily_load_tons FROM locations WHERE id = $1', [user.assigned_location_id]);
      if (locResult.rows.length > 0) {
        user.assignedLocation = locResult.rows[0];
      }
    }
    res.json({ user });
  } catch (err) {
    console.error('[Auth] GetMe error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
