// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  matricNumber: { type: String, required: true, unique: true },
  dateStarted: { type: Date, required: true },
  department: { type: String, default: 'Computer Science' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  level: { type: String, default: '100' },
  cgpa: { type: String, default: '0.0' },
  status: { type: String, default: 'active' },
  lastActive: { type: Date, default: Date.now },
  profileImage: String
});

module.exports = mongoose.model('User', userSchema);