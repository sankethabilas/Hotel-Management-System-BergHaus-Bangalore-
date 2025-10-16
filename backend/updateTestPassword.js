const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/database');
require('dotenv').config();

const updatePassword = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected...');

    const user = await User.findOne({ email: 'testguest@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    user.password = await bcrypt.hash('guest123', 10);
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: testguest@gmail.com');
    console.log('🔑 New Password: guest123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updatePassword();
