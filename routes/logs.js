// backend/routes/logs.js
const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { getLogs } = require('../controllers/logController');

router.get('/', auth, admin, getLogs);

module.exports = router;