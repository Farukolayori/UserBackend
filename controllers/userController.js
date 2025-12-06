const User = require('../models/User');
const Log = require('../models/Log');

exports.getAllUsers = async (req, res) => {
  try {
    const { search = '', role = 'all', status = 'all' } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { matricNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (role !== 'all') query.role = role;
    if (status !== 'all') query.status = status;

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    await new Log({ user: `${user.firstName} ${user.lastName}`, action: 'Updated', type: 'update' }).save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);
    await new Log({ user: `${user.firstName} ${user.lastName}`, action: 'Deleted', type: 'delete' }).save();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email matricNumber level cgpa status -_id');
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