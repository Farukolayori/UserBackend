// routes/logs.js
const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/logs
// @desc    Get all activity logs
// @access  Private (Admin only)
router.get('/', auth, admin, getLogs);

module.exports = router;