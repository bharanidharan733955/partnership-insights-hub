const express = require('express');
const { submitSales, getSalesHistory } = require('../controllers/salesController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

router.use(auth);

router.post('/', rbac(['PARTNER']), submitSales);
router.get('/history', getSalesHistory);

module.exports = router;
