const mongoose = require('mongoose');
require('dotenv').config();

const checkHealth = async () => {
  console.log('🏥 Running MongoDB Health Check...\n');
  
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    details: {},
    errors: []
  };
  
  try {
    const startTime = Date.now();
    
    // 1. Test connection
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });
    
    const connectionTime = Date.now() - startTime;
    healthStatus.details.connectionTime = `${connectionTime}ms`;
    
    // 2. Check connection state
    healthStatus.details.connectionState = mongoose.connection.readyState;
    healthStatus.details.connectionStateText = 
      mongoose.connection.readyState === 1 ? 'Connected' :
      mongoose.connection.readyState === 2 ? 'Connecting' :
      mongoose.connection.readyState === 3 ? 'Disconnecting' : 'Disconnected';
    
    // 3. Test query performance
    const queryStart = Date.now();
    await mongoose.connection.db.admin().ping();
    healthStatus.details.pingTime = `${Date.now() - queryStart}ms`;
    
    // 4. Check database stats
    const stats = await mongoose.connection.db.stats();
    healthStatus.details.databaseStats = {
      collections: stats.collections,
      objects: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
    };
    
    // 5. Check if required collections exist
    const requiredCollections = ['users', 'activitylogs'];
    const existingCollections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = existingCollections.map(col => col.name);
    
    healthStatus.details.missingCollections = requiredCollections.filter(
      col => !collectionNames.includes(col)
    );
    
    if (healthStatus.details.missingCollections.length > 0) {
      healthStatus.status = 'degraded';
      healthStatus.errors.push(`Missing collections: ${healthStatus.details.missingCollections.join(', ')}`);
    } else {
      healthStatus.status = 'healthy';
    }
    
    // 6. Check user count
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    healthStatus.details.userCount = userCount;
    
    await mongoose.disconnect();
    
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.errors.push(error.message);
  }
  
  // Print health report
  console.log('📋 HEALTH REPORT');
  console.log('================');
  console.log(`Status: ${healthStatus.status === 'healthy' ? '✅ HEALTHY' : 
    healthStatus.status === 'degraded' ? '⚠️ DEGRADED' : '❌ UNHEALTHY'}`);
  console.log(`Timestamp: ${healthStatus.timestamp}`);
  
  console.log('\n📊 Details:');
  Object.entries(healthStatus.details).forEach(([key, value]) => {
    if (typeof value === 'object') {
      console.log(`  ${key}:`);
      Object.entries(value).forEach(([subKey, subValue]) => {
        console.log(`    ${subKey}: ${subValue}`);
      });
    } else {
      console.log(`  ${key}: ${value}`);
    }
  });
  
  if (healthStatus.errors.length > 0) {
    console.log('\n❌ Errors:');
    healthStatus.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Exit with appropriate code
  process.exit(healthStatus.status === 'healthy' ? 0 : 
    healthStatus.status === 'degraded' ? 1 : 2);
};

checkHealth();