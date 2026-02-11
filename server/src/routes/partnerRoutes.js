const express = require('express');
const { getPartners, createPartner, createBranch } = require('../controllers/partnerController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

router.use(auth);

router.get('/', getPartners);
router.post('/', rbac(['ANALYST']), createPartner);
router.post('/branches', rbac(['ANALYST']), createBranch);

module.exports = router;
