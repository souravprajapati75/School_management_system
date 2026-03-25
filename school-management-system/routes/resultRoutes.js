// routes/resultRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/resultController');

router.post('/',        ctrl.create);
router.get('/',         ctrl.getAll);
router.get('/toppers',  ctrl.toppers);

module.exports = router;
