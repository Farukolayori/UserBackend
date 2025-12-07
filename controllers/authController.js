// controllers/authController.js
const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateStarted } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check if user exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Generate matric number (format: CS/2025/0001)
    const year = new Date().getFullYear();
    const count = await User.countDocuments();
    const matricNumber = `CS/${year}/${String(count + 1).padStart(4, '0')}`;

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashed,
      matricNumber,
      dateStarted: dateStarted || new Date(),
      department: 'Computer Science',
      role: 'student',
      status: 'active'
    });

    await user.save();

    // Log activity
    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Registered new account',
      type: 'register'
    }).save();

    res.status(201).json({ 
      message: 'Registration successful!',
      matricNumber: user.matricNumber
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Log activity
    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Logged in',
      type: 'login'
    }).save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        matricNumber: user.matricNumber,
        department: user.department,
        role: user.role,
        status: user.status,
        level: user.level,
        cgpa: user.cgpa
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user (for auto-login)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getCurrentUser };