const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

async function debugBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('Connected to MongoDB');

    // Get all bookings
    const bookings = await Booking.find({}).populate('guestId', 'firstName lastName email');
    console.log('\n=== ALL BOOKINGS ===');
    console.log(`Total bookings: ${bookings.length}`);
    
    bookings.forEach((booking, index) => {
      console.log(`\nBooking ${index + 1}:`);
      console.log(`  ID: ${booking._id}`);
      console.log(`  Guest ID: ${booking.guestId}`);
      console.log(`  Guest Name: ${booking.guestName}`);
      console.log(`  Guest Email: ${booking.guestEmail}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Room: ${booking.roomNumber}`);
      console.log(`  Booking Date: ${booking.bookingDate}`);
      
      if (booking.guestId && typeof booking.guestId === 'object') {
        console.log(`  Guest User: ${booking.guestId.firstName} ${booking.guestId.lastName} (${booking.guestId.email})`);
      }
    });

    // Get all users
    const users = await User.find({});
    console.log('\n=== ALL USERS ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugBookings();
