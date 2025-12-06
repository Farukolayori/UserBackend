const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { getAllUsers, updateUser, deleteUser, exportCSV } = require('../controllers/userController');

router.get('/', auth, admin, getAllUsers);
router.put('/:id', auth, admin, updateUser);
router.delete('/:id', auth, admin, deleteUser);
router.get('/export', auth, admin, exportCSV);

module.exports = router;