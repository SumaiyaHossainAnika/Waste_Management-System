const router = require('express').Router();
const ctrl = require('../controllers/collection.controller');
const { auth, roleGuard } = require('../middleware/auth');
router.get('/', auth, roleGuard('manager'), ctrl.getAll);
router.post('/', auth, roleGuard('manager'), ctrl.create);
router.get('/analytics', auth, roleGuard('manager'), ctrl.getAnalytics);
router.delete('/:id', auth, roleGuard('manager'), ctrl.deleteRecord);
module.exports = router;
