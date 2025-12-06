// backend/controllers/authController.js
const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, matricNumber, dateStarted } = req.body;

    if (!firstName || !lastName || !email || !password || !matricNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { matricNumber: matricNumber.toUpperCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Matric number already in use'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashed,
      matricNumber: matricNumber.toUpperCase(),
      dateStarted: dateStarted || new Date(),
      department: 'Computer Science',
      role: 'student',
      status: 'active'
    });

    await user.save();

    await new Log({
      user: user.fullName,
      action: 'Registered',
      type: 'register',
      userId: user._id
    }).save();

    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await new Log({
      user: user.fullName,
      action: 'Logged in',
      type: 'login',
      userId: user._id
    }).save();

    res.json({
      message: 'Login successful',
      token,
      user: {
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
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      matricNumber: user.matricNumber,
      role: user.role,
      level: user.level || '100',
      cgpa: user.cgpa || '0.0',
      status: user.status,
      department: user.department,
      dateStarted: user.dateStarted
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};