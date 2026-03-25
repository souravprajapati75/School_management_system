// routes/feeRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/feeController');

router.post('/',            ctrl.create);
router.get('/',             ctrl.getAll);
router.get('/summary',      ctrl.summary);
router.patch('/:id/pay',    ctrl.markPaid);

module.exports = router;
