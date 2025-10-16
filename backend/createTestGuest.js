const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Loyalty = require('./models/loyaltyModel');
const connectDB = require('./config/database');
require('dotenv').config();

const createTestGuest = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB Connected...');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testguest@gmail.com' });
    
    if (existingUser) {
      console.log('✅ Test guest user already exists!');
      console.log('Email: testguest@gmail.com');
      console.log('Password: guest123');
      console.log('Role: guest');
      console.log('🆔 User ID:', existingUser._id);
      
      // Check loyalty enrollment
      let loyalty = await Loyalty.findOne({ userId: existingUser._id });
      if (!loyalty) {
        console.log('⚠️  Not enrolled in loyalty program yet');
        console.log('🔄 Creating loyalty enrollment...');
        
        // Create loyalty enrollment
        loyalty = await Loyalty.create({
          userId: existingUser._id,
          guestId: existingUser._id.toString(),
          guestName: `${existingUser.firstName} ${existingUser.lastName}`,
          email: existingUser.email,
          phone: existingUser.phone,
          points: 0,
          tier: 'Silver',
          status: 'active'
        });
        
        console.log('✅ Loyalty membership created!');
        console.log('🎯 Guest ID:', loyalty.guestId);
        console.log('⭐ Tier: Silver');
        console.log('💰 Points: 0');
      } else {
        console.log(`✅ Loyalty Member: ${loyalty.tier} tier with ${loyalty.points} points`);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎉 Ready to test automation rules!');
      console.log('📝 You can now:');
      console.log('   1. Login with testguest@gmail.com / guest123');
      console.log('   2. Create bookings to trigger rules');
      console.log('   3. Submit feedback to test feedback rules');
      console.log('   4. Check points earned automatically\n');
      
      process.exit(0);
    }

    // Create test guest user
    const testGuest = await User.create({
      firstName: 'Test',
      lastName: 'Guest',
      email: 'testguest@gmail.com',
      password: await bcrypt.hash('guest123', 10),
      role: 'guest',
      phone: '+1234567890',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA'
      },
      isActive: true,
      dateOfBirth: '1990-01-01'
    });

    console.log('✅ Test guest user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: testguest@gmail.com');
    console.log('🔑 Password: guest123');
    console.log('👤 Role: guest');
    console.log('🆔 User ID:', testGuest._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create loyalty enrollment for the test guest
    const loyalty = await Loyalty.create({
      userId: testGuest._id,
      guestId: testGuest._id.toString(),
      guestName: `${testGuest.firstName} ${testGuest.lastName}`,
      email: testGuest.email,
      phone: testGuest.phone,
      points: 0,
      tier: 'Silver',
      status: 'active'
    });

    console.log('✅ Loyalty membership created!');
    console.log('🎯 Guest ID:', loyalty.guestId);
    console.log('⭐ Tier: Silver');
    console.log('💰 Points: 0');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Ready to test automation rules!');
    console.log('📝 You can now:');
    console.log('   1. Login with testguest@gmail.com / guest123');
    console.log('   2. Create bookings to trigger rules');
    console.log('   3. Submit feedback to test feedback rules');
    console.log('   4. Check points earned automatically\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test guest:', error.message);
    process.exit(1);
  }
};

createTestGuest();
