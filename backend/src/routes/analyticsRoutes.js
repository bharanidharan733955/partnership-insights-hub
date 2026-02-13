const express = require('express');
const { getOverview } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

router.use(auth);
router.get('/overview', rbac(['ANALYST']), getOverview);

module.exports = router;
