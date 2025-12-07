// controllers/logController.js
const Log = require('../models/Log');

// Get all activity logs
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })  // Newest first
      .limit(50);  // Last 50 logs
    
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLogs };