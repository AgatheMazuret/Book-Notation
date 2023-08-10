const express = require('express');
const router = express.Router();
const email = require('../middleware/email');
const password = require('../middleware/password');

const userCtrl = require('../controllers/user');

router.post('/signup', email, password, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;