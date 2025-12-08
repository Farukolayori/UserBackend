const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// ADMIN CREDENTIALS - Updated to match frontend
const ADMIN_EMAIL = 'diamond@gmail.com';
const ADMIN_PASSWORD = 'Olayori25';
const ADMIN_FIRST_NAME = 'Pelumi';
const ADMIN_LAST_NAME = 'Ariyo';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('❌ No MongoDB URI found in environment variables!');
    }

    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected for seeding');
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    console.log(`🔍 Checking if admin exists: ${ADMIN_EMAIL}`);
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('═══════════════════════════════════');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔐 Role:', existingAdmin.role);
      console.log('📊 Status:', existingAdmin.status);
      console.log('═══════════════════════════════════');
      
      // Ensure the user has admin role
      if (existingAdmin.role !== 'admin') {
        console.log('🔄 Upgrading user to admin...');
        existingAdmin.role = 'admin';
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('✅ User upgraded to admin successfully!');
      } else {
        console.log('✅ User is already an admin');
      }
      
      console.log('\n🔑 Login Credentials:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('\n🚀 You can now login as admin!');
      return;
    }

    // Create new admin
    console.log('🔄 No existing admin found. Creating new admin user...');
    
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('🔐 Password hashed successfully');

    const admin = new User({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      department: 'Computer Science',
      role: 'admin', // IMPORTANT: Set role to 'admin'
      level: '500',
      cgpa: '5.0',
      status: 'active',
      lastActive: new Date()
    });

    console.log('💾 Saving admin to database...');
    const savedAdmin = await admin.save();
    
    console.log('\n🎉 SUCCESS: Admin created!');
    console.log('═══════════════════════════════════');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('👤 Name:', ADMIN_FIRST_NAME, ADMIN_LAST_NAME);
    console.log('🔐 Role: admin');
    console.log('📊 Status: active');
    console.log('═══════════════════════════════════');
    console.log('\n🚀 You can now login with these credentials!');
    console.log('📍 Frontend will recognize this email as admin');
    
  } catch (err) {
    console.error('\n❌ Error creating admin:', err.message);
    
    if (err.code === 11000) {
      console.error('💡 Duplicate key error - Admin with this email already exists');
    } else {
      console.error('Full error:', err);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
console.log('🚀 Starting Admin Seed Script...');
console.log('═══════════════════════════════════');
createAdmin();