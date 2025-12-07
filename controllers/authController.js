const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashed,
      department: 'Computer Science',
      role: 'student',
      status: 'active'
    });

    const savedUser = await user.save();  // Add this line
    console.log('✅ New user saved:', savedUser._id);  // Log success

    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Registered new account',
      type: 'register'
    }).save();

    res.status(201).json({ 
      message: 'Registration successful!',
      userId: savedUser._id  // Bonus: return ID
    });
  } catch (err) {
    console.error('🚨 Register ERROR:', err);  // Better logging
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined  // Show details in dev
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    await new Log({
      user: `${user.firstName} ${user.lastName}`,
      action: 'Logged in',
      type: 'login'
    }).save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
        level: user.level,
        cgpa: user.cgpa,
        lastActive: user.lastActive
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user (for auto-login)
// Update getCurrentUser to return full user data
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return full user object with all fields
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      level: user.level,
      cgpa: user.cgpa,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getCurrentUser };