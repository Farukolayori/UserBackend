const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { ROLES, STATUS, DEPARTMENTS, LEVELS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    // ... (previous schema fields remain the same)
    // Add these indexes for better MongoDB Atlas performance
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create compound indexes for common queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ matricNumber: 1 }, { unique: true });
userSchema.index({ status: 1, role: 1 });
userSchema.index({ department: 1, level: 1 });
userSchema.index({ cgpa: -1 }); // For sorting by CGPA
userSchema.index({ createdAt: -1 }); // For getting latest users
userSchema.index({ lastActive: -1 }); // For activity tracking

// Text index for search functionality
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  matricNumber: 'text'
}, {
  name: 'UserSearchIndex',
  weights: {
    matricNumber: 10,
    firstName: 5,
    lastName: 5,
    email: 3
  }
});

// ... (rest of the model remains the same)