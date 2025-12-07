// controllers/userController.js
const User = require('../models/User');
const Log = require('../models/Log');

// Get all users with search and filters
const getAllUsers = async (req, res) => {
  try {
    const { search = '', role = 'all', status = 'all' } = req.query;
    
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { matricNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (role !== 'all') query.role = role;
    
    // Status filter
    if (status !== 'all') query.status = status;

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Profile updated',
      type: 'update'
    }).save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Log activity
    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Account deleted',
      type: 'delete'
    }).save();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export users as CSV
const exportCSV = async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email matricNumber level cgpa status');
    
    let csv = 'Name,Email,Matric Number,Level,CGPA,Status\n';
    
    users.forEach(u => {
      csv += `"${u.firstName} ${u.lastName}",${u.email},${u.matricNumber},${u.level || 'N/A'},${u.cgpa || '0.0'},${u.status}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('cs_students.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser, exportCSV };