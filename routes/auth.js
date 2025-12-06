// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getCurrentUser);  // ← NOW WORKS

module.exports = router;