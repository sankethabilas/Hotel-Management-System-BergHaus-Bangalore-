const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@berghausbungalow.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@berghausbungalow.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin',
      phone: '+919876543210',
      address: {
        street: '123 Admin Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      },
      isActive: true,
      isGoogleUser: false
    });

    console.log('🎉 Admin user created successfully!');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Password: admin123 (hashed in database)`);
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('===========================');
    console.log('Email: admin@berghausbungalow.com');
    console.log('Password: admin123');
    
    console.log('\n🔗 Frontend URLs:');
    console.log('=================');
    console.log('• Sign In: http://localhost:3000/auth/signin');
    console.log('• Admin Dashboard: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createAdminUser();
