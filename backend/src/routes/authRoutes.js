const express = require('express');
const { login, register, googleLogin, googleRegister } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // For demo/seeding purposes
router.post('/google-login', googleLogin);
router.post('/google-register', googleRegister);

module.exports = router;
