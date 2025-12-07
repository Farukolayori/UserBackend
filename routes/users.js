const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, exportCSV } = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (with filters)
// @access  Private (Admin only)
router.get('/', auth, admin, getAllUsers);

// @route   GET /api/users/export
// @desc    Export users as CSV
// @access  Private (Admin only)
router.get('/export', auth, admin, exportCSV);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', auth, admin, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, admin, deleteUser);

module.exports = router;