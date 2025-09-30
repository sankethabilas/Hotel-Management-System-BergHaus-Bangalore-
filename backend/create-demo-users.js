const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const demoUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hms.com',
    password: 'Admin123',
    role: 'admin',
    phone: '1234567890',
    address: {
      street: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345'
    }
  },
  {
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@hms.com',
    password: 'Employee123',
    role: 'employee',
    phone: '1234567891',
    address: {
      street: '456 Employee Ave',
      city: 'Employee City',
      state: 'EC',
      zipCode: '54321'
    }
  },
  {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@hms.com',
    password: 'Guest123',
    role: 'guest',
    phone: '1234567892',
    address: {
      street: '789 Guest Blvd',
      city: 'Guest City',
      state: 'GC',
      zipCode: '98765'
    }
  }
];

const createDemoUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hms';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo users
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@hms.com / Admin123');
    console.log('Employee: employee@hms.com / Employee123');
    console.log('Guest: guest@hms.com / Guest123');

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

createDemoUsers();

