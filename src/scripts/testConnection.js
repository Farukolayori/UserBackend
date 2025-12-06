const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`Connection URI: ${maskedUri}`);
  
  try {
    // Connect with shorter timeout for testing
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('\n✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📈 Port: ${mongoose.connection.port}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections in database:');
    collections.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.name}`);
    });
    
    // Check document counts
    console.log('\n📊 Document counts:');
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
    
    // Test a simple query
    console.log('\n🧪 Running test query...');
    const testResult = await mongoose.connection.db.admin().ping();
    console.log(`🏓 Ping result: ${JSON.stringify(testResult)}`);
    
    await mongoose.disconnect();
    console.log('\n🎉 All tests passed! Connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to MongoDB Atlas');
    console.error(`Message: ${error.message}`);
    
    if (error.name === 'MongoNetworkError') {
      console.error('\n🔌 Possible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Make sure MongoDB Atlas allows connections from your IP');
      console.error('3. Verify the connection string format');
    } else if (error.message.includes('auth failed')) {
      console.error('\n🔐 Authentication failed. Please check:');
      console.error('1. Username and password are correct');
      console.error('2. Database user has proper permissions');
    }
    
    process.exit(1);
  }
};

testConnection();