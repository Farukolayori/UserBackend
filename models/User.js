// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false  // Don't include password by default
  },
  matricNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  dateStarted: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  level: {
    type: String,
    enum: ['100', '200', '300', '400', '500'],
    default: '100'
  },
  cgpa: {
    type: String,
    default: '0.00'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ matricNumber: 1 });
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);