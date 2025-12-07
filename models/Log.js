const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['login', 'register', 'update', 'delete'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);