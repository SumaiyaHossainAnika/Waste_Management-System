const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://waste-management-system-wheat-beta.vercel.app'
];

const isDev = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || isDev) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (origin.startsWith('http://192.168.') || origin.startsWith('http://10.') || origin.startsWith('http://172.')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/locations', require('./routes/location.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/collections', require('./routes/collection.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/heatmap', require('./routes/heatmap.routes'));
app.use('/api/routes', require('./routes/route.routes'));
app.use('/api/roads', require('./routes/road.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

module.exports = app;
