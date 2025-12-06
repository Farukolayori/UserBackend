// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'pelumi@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Existing user upgraded to admin');
      }
      process.exit(0);
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash('Olayori25', 10);

    const admin = new User({
      firstName: 'Pelumi',
      lastName: 'Ariyo',
      email: 'pelumi@gmail.com',
      password: hashedPassword,
      matricNumber: 'ADMIN001',
      dateStarted: new Date('2025-12-07'),
      department: 'Computer Science',
      role: 'admin',           // This is the key
      level: '500',
      cgpa: '5.0',
      status: 'active'
    });

    await admin.save();
    console.log('SUCCESS: Admin created!');
    console.log('Email: pelumi@gmail.com');
    console.log('Password: Olayori25');
    console.log('Login at your frontend and enjoy full admin access!');
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();