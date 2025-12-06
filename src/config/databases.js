const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Log the connection attempt (without showing password)
    const uri = process.env.MONGODB_URI;
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    logger.info(`🔄 Attempting to connect to MongoDB...`);
    logger.debug(`Connection URI: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logger.info(`✅ MongoDB Connected Successfully!`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🌐 Host: ${conn.connection.host}`);
    logger.info(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected successfully!');
    });

    mongoose.connection.on('reconnectFailed', () => {
      logger.error('❌ MongoDB reconnection failed!');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('👋 MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Test the connection with a simple query
    await mongoose.connection.db.admin().ping();
    logger.info('🏓 MongoDB ping successful!');

  } catch (error) {
    logger.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // More detailed error information
    if (error.name === 'MongoNetworkError') {
      logger.error('🔌 Network Error: Please check your internet connection and MongoDB Atlas network settings.');
    } else if (error.name === 'MongooseServerSelectionError') {
      logger.error('🎯 Server Selection Error: Could not connect to any servers in your MongoDB cluster.');
    } else if (error.name === 'MongoError' && error.code === 8000) {
      logger.error('🔐 Authentication Error: Please check your MongoDB username and password.');
    }
    
    logger.error('💡 Tips:');
    logger.error('1. Check if your MongoDB Atlas IP whitelist includes your current IP address');
    logger.error('2. Verify your username and password are correct');
    logger.error('3. Ensure your network allows connections to MongoDB Atlas');
    
    process.exit(1);
  }
};

module.exports = connectDB;