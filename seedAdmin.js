const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB with better error handling
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
    const existingAdmin = await User.findOne({ email: 'pelumi@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔐 Role:', existingAdmin.role);
      
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Existing user upgraded to admin');
      } else {
        console.log('✅ User is already an admin');
      }
      
      console.log('\n🔑 Use password: Olayori25 to login');
      return;
    }

    // Create new admin
    console.log('🔄 Creating new admin user...');
    
    const hashedPassword = await bcrypt.hash('Olayori25', 10);

    const admin = new User({
      firstName: 'Pelumi',
      lastName: 'Ariyo',
      email: 'pelumi@gmail.com',
      password: hashedPassword,
      department: 'Computer Science',
      role: 'admin',
      level: '500',
      cgpa: '5.0',
      status: 'active',
      lastActive: new Date()
    });

    const savedAdmin = await admin.save();
    
    console.log('\n✅ SUCCESS: Admin created!');
    console.log('═══════════════════════════════════');
    console.log('📧 Email: pelumi@gmail.com');
    console.log('🔑 Password: Olayori25');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', savedAdmin._id);
    console.log('═══════════════════════════════════');
    console.log('🚀 You can now login with these credentials!');
    
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
createAdmin();