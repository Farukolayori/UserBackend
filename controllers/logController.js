// backend/controllers/logController.js
const Log = require('../models/Log');

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};