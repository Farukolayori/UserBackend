// backend/controllers/authController.js
const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER - Keep matric number for registration
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, matricNumber, dateStarted } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !matricNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { matricNumber: matricNumber.toUpperCase() }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already exists' 
          : 'Matric number already exists' 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      matricNumber: matricNumber.toUpperCase(),
      dateStarted: dateStarted || new Date().toISOString().split('T')[0],
      department: 'Computer Science', // Default department
      role: 'student', // Default role
      status: 'active' // Default status
    });

    await user.save();
    
    // Log the registration
    await new Log({ 
      user: `${firstName} ${lastName}`, 
      action: 'Registered new account', 
      type: 'register',
      userId: user._id
    }).save();

    res.status(201).json({ 
      message: 'Registration successful! Please login.',
      user: {
        firstName,
        lastName,
        email,
        matricNumber: user.matricNumber
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    const message = err.code === 11000
      ? 'Email or Matric Number already exists'
      : err.message || 'Registration failed';
    res.status(400).json({ message });
  }
};

// LOGIN - Remove matric number requirement (email + password only)
const login = async (req, res) => {
  try {
    const { email, password } = req.body; // REMOVED matricNumber from login

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email only
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Your account is inactive. Please contact administrator.' 
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Log the login activity
    await new Log({ 
      user: `${user.firstName} ${user.lastName}`, 
      action: 'Logged in', 
      type: 'login',
      userId: user._id
    }).save();

    // Return response
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
        level: user.level || '100',
        cgpa: user.cgpa || '0.0',
        status: user.status || 'active',
        department: user.department || 'Computer Science',
        dateStarted: user.dateStarted,
        lastActive: user.lastActive
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET CURRENT USER - No changes needed
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
      status: user.status || 'active',
      department: user.department || 'Computer Science',
      dateStarted: user.dateStarted,
      lastActive: user.lastActive
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD FORGOT PASSWORD FUNCTION
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists or not
      return res.status(200).json({ 
        message: 'If your email exists in our system, you will receive password reset instructions.' 
      });
    }

    // Generate reset token (simple version - in production, use proper token generation)
    const resetToken = jwt.sign(
      { id: user._id, action: 'reset-password' },
      process.env.JWT_SECRET + user.password, // Add password to secret to invalidate when password changes
      { expiresIn: '1h' }
    );

    // TODO: In production, send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendResetEmail(user.email, user.firstName, resetLink);

    console.log(`Password reset token for ${user.email}: ${resetToken}`); // Remove in production

    res.status(200).json({ 
      message: 'Password reset instructions sent to your email (check console for token in development)',
      token: resetToken // Only for development!
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD RESET PASSWORD FUNCTION
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET + 'temp'); // Simplified for development
    } catch (err) {
      return res.status(400).json({ 
        message: 'Invalid or expired token' 
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Log the password reset
    await new Log({ 
      user: `${user.firstName} ${user.lastName}`, 
      action: 'Reset password', 
      type: 'update',
      userId: user._id
    }).save();

    res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
};