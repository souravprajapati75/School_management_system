// routes/attendanceRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/attendanceController');

router.post('/',                        ctrl.mark);
router.get('/',                         ctrl.getAll);
router.get('/today',                    ctrl.today);
router.get('/summary/:student_id',      ctrl.summary);

module.exports = router;
