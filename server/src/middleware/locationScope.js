const pool = require('../config/db');

/**
 * Middleware: Location-scoped access for managers
 * Restricts managers to view/edit only their assigned location's data
 * Citizens can view all locations
 */
const locationScope = async (req, res, next) => {
  try {
    const user = req.user; // Set by auth middleware
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // Citizens can access all locations
    if (user.role === 'citizen') {
      req.userLocationId = null;
      return next();
    }

    // Managers must have assigned location
    if (user.role === 'manager') {
      const result = await pool.query(
        'SELECT assigned_location_id FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0 || !result.rows[0].assigned_location_id) {
        return res.status(403).json({ error: 'Manager must be assigned to a location' });
      }

      req.userLocationId = result.rows[0].assigned_location_id;
      return next();
    }

    res.status(403).json({ error: 'Invalid role' });
  } catch (err) {
    console.error('[LocationScope] Middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Helper: Add location filter to SQL WHERE clause
 * For managers: filters to their assigned location
 * For citizens: returns empty (no filter)
 */
const buildLocationFilter = (userLocationId) => {
  if (userLocationId) {
    return { column: 'location_id', value: userLocationId };
  }
  return null;
};

/**
 * Helper: Attach location_id when creating location-scoped resources
 * Ensures managers can't create resources for other locations
 */
const enforceLocationCreation = (req, userLocationId) => {
  if (userLocationId) {
    req.body.location_id = userLocationId;
  }
};

module.exports = { locationScope, buildLocationFilter, enforceLocationCreation };
