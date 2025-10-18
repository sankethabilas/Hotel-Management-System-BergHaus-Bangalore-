const mongoose = require('mongoose');
const User = require('./models/User');
const Loyalty = require('./models/loyaltyModel');
const connectDB = require('./config/database');
require('dotenv').config();

const checkAndEnrollGuest = async (email) => {
  try {
    await connectDB();
    console.log('MongoDB Connected...');

    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log('💡 The user needs to be created first (via booking or registration)');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Name:', `${user.firstName} ${user.lastName}`);
    console.log('📧 Email:', user.email);
    console.log('🆔 User ID:', user._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check loyalty enrollment
    let loyalty = await Loyalty.findOne({ userId: user._id });
    
    if (!loyalty) {
      console.log('⚠️  NOT enrolled in loyalty program');
      console.log('🔄 Creating loyalty enrollment...\n');
      
      // Create loyalty enrollment
      loyalty = await Loyalty.create({
        userId: user._id,
        guestId: user._id.toString(),
        guestName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        points: 0,
        tier: 'Silver',
        status: 'active'
      });
      
      console.log('✅ Loyalty membership created!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 Guest ID:', loyalty.guestId);
      console.log('⭐ Tier: Silver');
      console.log('💰 Points: 0');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('✅ Already enrolled in loyalty program!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 Guest ID:', loyalty.guestId);
      console.log('⭐ Tier:', loyalty.tier);
      console.log('💰 Points:', loyalty.points);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('\n🎉 Guest is ready for automated rules!');
    console.log('📝 Next steps:');
    console.log('   1. Create a new booking with this email');
    console.log('   2. Rules will automatically trigger');
    console.log('   3. Check points in Loyalty Dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument or use default
const email = process.argv[2] || 'testguesttest@gmail.com';
console.log(`\n🔍 Checking guest: ${email}\n`);
checkAndEnrollGuest(email);
