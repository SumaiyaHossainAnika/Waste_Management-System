const router = require('express').Router();
const ctrl = require('../controllers/heatmap.controller');
const { auth } = require('../middleware/auth');
const { locationScope } = require('../middleware/locationScope');
router.get('/hotspots', auth, locationScope, ctrl.getHotspots);
router.get('/:type', auth, locationScope, ctrl.getHeatmapData);
module.exports = router;
