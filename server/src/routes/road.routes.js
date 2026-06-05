const router = require('express').Router();
const ctrl = require('../controllers/road.controller');
const { auth, roleGuard } = require('../middleware/auth');
router.post('/analyze', auth, roleGuard('manager'), ctrl.analyzeRoad);
router.get('/', auth, roleGuard('manager'), ctrl.getAll);
router.post('/', auth, roleGuard('manager'), ctrl.save);
router.get('/recommend/:id', auth, roleGuard('manager'), ctrl.getRecommendation);
module.exports = router;
