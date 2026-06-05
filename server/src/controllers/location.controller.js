const pool = require('../config/db');

/**
 * Get all locations
 * Managers: Only their assigned location
 * Citizens: All locations
 */
exports.getAll = async (req, res) => {
  try {
    let query = 'SELECT * FROM locations ORDER BY name ASC';
    let params = [];
    
    // If manager, restrict to their assigned location or any location sharing the same ward(s)
    if (req.user?.role === 'manager' && req.userLocationId) {
      const managerLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [req.userLocationId]);
      if (managerLocRes.rows.length > 0 && managerLocRes.rows[0].wards) {
        const wards = managerLocRes.rows[0].wards;
        query = 'SELECT * FROM locations WHERE id = $1 OR wards && $2 ORDER BY name ASC';
        params = [req.userLocationId, wards];
      } else {
        query = 'SELECT * FROM locations WHERE id = $1 ORDER BY name ASC';
        params = [req.userLocationId];
      }
    }
    
    const result = await pool.query(query, params);
    res.json({ locations: result.rows });
  } catch (err) {
    console.error('[Location] GetAll error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get location by ID
 * Managers: Can only access their assigned location or locations in their assigned ward(s)
 * Citizens: Can access any location
 */
exports.getById = async (req, res) => {
  try {
    const locId = parseInt(req.params.id);
    
    // Managers can only access their assigned location or locations in their assigned ward(s)
    if (req.user?.role === 'manager' && req.userLocationId && req.userLocationId !== locId) {
      const managerLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [req.userLocationId]);
      const targetLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [locId]);
      
      const managerWards = managerLocRes.rows[0]?.wards || [];
      const targetWards = targetLocRes.rows[0]?.wards || [];
      
      const hasIntersection = managerWards.some(w => targetWards.includes(w));
      if (!hasIntersection) {
        return res.status(403).json({ error: 'Access denied. You can only access locations in your assigned ward(s).' });
      }
    }
    
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [locId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found.' });
    res.json({ location: result.rows[0] });
  } catch (err) {
    console.error('[Location] GetById error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    let { name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements } = req.body;
    
    // If manager, default to their assigned location's wards so they can see and manage it
    if (!wards && req.user?.role === 'manager' && req.userLocationId) {
      const managerLocRes = await pool.query('SELECT wards FROM locations WHERE id = $1', [req.userLocationId]);
      if (managerLocRes.rows.length > 0) {
        wards = managerLocRes.rows[0].wards;
      }
    }

    const result = await pool.query(
      `INSERT INTO locations (name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems || [], improvements || []]
    );
    res.status(201).json({ location: result.rows[0] });
  } catch (err) {
    console.error('[Location] Create error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const locId = parseInt(req.params.id);
    const existing = await pool.query('SELECT * FROM locations WHERE id = $1', [locId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Location not found.' });

    const current = existing.rows[0];

    const name = req.body.name !== undefined ? req.body.name : current.name;
    const latitude = req.body.latitude !== undefined ? req.body.latitude : current.latitude;
    const longitude = req.body.longitude !== undefined ? req.body.longitude : current.longitude;
    const covered_area = req.body.covered_area !== undefined ? req.body.covered_area : current.covered_area;
    const wards = req.body.wards !== undefined ? req.body.wards : current.wards;
    const total_employees = req.body.total_employees !== undefined ? req.body.total_employees : current.total_employees;
    const daily_load_tons = req.body.daily_load_tons !== undefined ? req.body.daily_load_tons : current.daily_load_tons;
    const peak_day = req.body.peak_day !== undefined ? req.body.peak_day : current.peak_day;
    const sorting_system = req.body.sorting_system !== undefined ? req.body.sorting_system : current.sorting_system;
    const problems = req.body.problems !== undefined ? req.body.problems : current.problems;
    const improvements = req.body.improvements !== undefined ? req.body.improvements : current.improvements;
    const status = req.body.status !== undefined ? req.body.status : current.status;

    const result = await pool.query(
      `UPDATE locations SET name=$1, latitude=$2, longitude=$3, covered_area=$4, wards=$5, total_employees=$6, daily_load_tons=$7, peak_day=$8, sorting_system=$9, problems=$10, improvements=$11, status=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements, status, locId]
    );
    res.json({ location: result.rows[0] });
  } catch (err) {
    console.error('[Location] Update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found.' });
    res.json({ message: 'Location deleted.' });
  } catch (err) {
    console.error('[Location] Delete error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    let locFilter = '';
    let targetFilter = '';
    let params = [];
    
    // If manager, restrict stats to their assigned location specifically
    if (req.user?.role === 'manager' && req.userLocationId) {
      locFilter = 'WHERE id = $1';
      targetFilter = 'WHERE location_id = $1';
      params = [req.userLocationId];
    }
    
    const locations = await pool.query(`SELECT COUNT(*) as count FROM locations ${locFilter}`, params);
    const vehicles = await pool.query(`SELECT COUNT(*) as count FROM vehicles ${targetFilter}`, params);
    const employees = await pool.query(`SELECT COALESCE(SUM(total_employees), 0) as count FROM locations ${locFilter}`, params);
    
    // Scoped complaints using geographical distance and ward overlap
    let complaintFilter = '';
    let pendingComplaintFilter = '';
    if (req.user?.role === 'manager' && req.userLocationId) {
      complaintFilter = `
        WHERE (
          SELECT l.wards && (SELECT wards FROM locations WHERE id = $1)
          FROM locations l 
          ORDER BY (c.latitude - l.latitude) * (c.latitude - l.latitude) + (c.longitude - l.longitude) * (c.longitude - l.longitude) ASC 
          LIMIT 1
        ) = true
      `;
      pendingComplaintFilter = `
        WHERE c.status = 'pending' AND (
          SELECT l.wards && (SELECT wards FROM locations WHERE id = $1)
          FROM locations l 
          ORDER BY (c.latitude - l.latitude) * (c.latitude - l.latitude) + (c.longitude - l.longitude) * (c.longitude - l.longitude) ASC 
          LIMIT 1
        ) = true
      `;
    } else {
      complaintFilter = '';
      pendingComplaintFilter = "WHERE c.status = 'pending'";
    }

    const complaints = await pool.query(`
      SELECT COUNT(*) as count 
      FROM complaints c
      ${complaintFilter}
    `, params.length > 0 ? params : []);

    const pendingComplaints = await pool.query(`
      SELECT COUNT(*) as count 
      FROM complaints c
      ${pendingComplaintFilter}
    `, params.length > 0 ? params : []);

    const totalWaste = await pool.query(`SELECT COALESCE(SUM(daily_load_tons), 0) as total FROM locations ${locFilter}`, params);
    const bins = await pool.query(`SELECT COUNT(*) as count FROM waste_bins ${targetFilter}`, params);
    const hotspots = await pool.query(`SELECT COUNT(*) as count FROM dumping_hotspots ${targetFilter}`, params);
 
    res.json({
      stats: {
        locations: parseInt(locations.rows[0].count),
        vehicles: parseInt(vehicles.rows[0].count),
        employees: parseInt(employees.rows[0].count),
        complaints: parseInt(complaints.rows[0].count),
        pendingComplaints: parseInt(pendingComplaints.rows[0].count),
        totalDailyWasteTons: parseFloat(totalWaste.rows[0].total),
        bins: parseInt(bins.rows[0].count),
        hotspots: parseInt(hotspots.rows[0].count),
      }
    });
  } catch (err) {
    console.error('[Location] Stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
