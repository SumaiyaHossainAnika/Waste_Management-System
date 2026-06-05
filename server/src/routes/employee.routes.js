const router = require('express').Router();
const ctrl = require('../controllers/employee.controller');
const { auth, roleGuard } = require('../middleware/auth');
router.get('/', auth, roleGuard('manager'), ctrl.getAll);
router.post('/', auth, roleGuard('manager'), ctrl.create);
router.put('/:id', auth, roleGuard('manager'), ctrl.update);
router.delete('/:id', auth, roleGuard('manager'), ctrl.remove);
module.exports = router;
