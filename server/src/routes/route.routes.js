const router = require('express').Router();
const ctrl = require('../controllers/route.controller');
const { auth, roleGuard } = require('../middleware/auth');
router.post('/optimize', auth, roleGuard('manager'), ctrl.optimize);
router.get('/', auth, roleGuard('manager'), ctrl.getAll);
router.put('/:id/activate', auth, roleGuard('manager'), ctrl.activate);
module.exports = router;
