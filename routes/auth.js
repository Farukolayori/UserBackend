const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getCurrentUser);  // Now /api/auth/user

module.exports = router;