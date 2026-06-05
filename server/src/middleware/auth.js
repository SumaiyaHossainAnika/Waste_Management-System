const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // Make user information available to controllers
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userLocationId = decoded.assigned_location_id;

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }
};

const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  auth,
  roleGuard
};