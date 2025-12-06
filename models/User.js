// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  matricNumber: { type: String, required: true, unique: true, uppercase: true },
  dateStarted: { type: Date, required: true },
  department: { type: String, default: 'Computer Science' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  level: { type: String, default: '100' },
  cgpa: { type: String, default: '0.0' },
  status: { type: String, default: 'active' },
  lastActive: { type: Date, default: Date.now },
  profileImage: String
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);