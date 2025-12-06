const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, matricNumber, dateStarted } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      matricNumber: matricNumber.toUpperCase(),
      dateStarted
    });

    await user.save();
    await new Log({ user: `${firstName} ${lastName}`, action: 'Registered', type: 'register' }).save();

    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (err) {
    const message = err.code === 11000
      ? 'Email or Matric Number already exists'
      : err.message;
    res.status(400).json({ message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, matricNumber, password } = req.body;
    const user = await User.findOne({ email, matricNumber: matricNumber.toUpperCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await new Log({ user: `${user.firstName} ${user.lastName}`, action: 'Logged in', type: 'login' }).save();

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      matricNumber: user.matricNumber,
      role: user.role,
      level: user.level,
      cgpa: user.cgpa,
      status: user.status,
      department: user.department,
      dateStarted: user.dateStarted
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Add to authController.js
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};