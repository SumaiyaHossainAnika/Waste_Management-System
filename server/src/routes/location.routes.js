const router = require('express').Router();
const ctrl = require('../controllers/location.controller');
const { auth, roleGuard } = require('../middleware/auth');
const { locationScope } = require('../middleware/locationScope');

router.get('/stats', auth, locationScope, ctrl.getStats);
router.get('/', auth, locationScope, roleGuard('manager'), ctrl.getAll);
router.get('/:id', auth, locationScope, roleGuard('manager'), ctrl.getById);
router.post('/', auth, locationScope, roleGuard('manager'), ctrl.create);
router.put('/:id', auth, locationScope, roleGuard('manager'), ctrl.update);
router.delete('/:id', auth, locationScope, roleGuard('manager'), ctrl.remove);

module.exports = router;
