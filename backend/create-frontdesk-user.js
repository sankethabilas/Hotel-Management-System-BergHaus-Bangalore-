const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const frontdeskUser = {
  firstName: 'Front Desk',
  lastName: 'Staff',
  email: 'frontdesk@hms.com',
  password: 'Frontdesk123',
  role: 'frontdesk',
  phone: '1234567893',
  address: {
    street: '321 Front Desk St',
    city: 'Hotel City',
    state: 'HC',
    zipCode: '11111'
  }
};

const createFrontdeskUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hms';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if frontdesk user already exists
    const existingUser = await User.findOne({ email: frontdeskUser.email });
    if (existingUser) {
      console.log('⚠️  Front desk user already exists');
      return;
    }

    // Create frontdesk user
    const user = new User(frontdeskUser);
    await user.save();
    console.log(`✅ Created frontdesk user: ${user.email} (${user.role})`);

    console.log('\n🎉 Front desk user created successfully!');
    console.log('\nFront Desk Credentials:');
    console.log('Email: frontdesk@hms.com');
    console.log('Password: Frontdesk123');

  } catch (error) {
    console.error('❌ Error creating frontdesk user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

createFrontdeskUser();



