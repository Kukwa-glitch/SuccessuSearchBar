require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const createAdmin = async () => {
  try {
    await connectDB();

    const adminData = {
      name: 'Admin User',
      username: 'admin',
      password: 'kukz@213', // Change this!
      role: 'admin',
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: adminData.username });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    const admin = await User.create(adminData);
    console.log('✅ Admin user created successfully');
    console.log('Username:', admin.username);
    console.log('Password:', adminData.password);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();