const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://sankethabilaschk:Snk0021@a@cluster0.8qjqj.mongodb.net/hms?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testBookings() {
  try {
    console.log('=== TESTING BOOKINGS API ===');
    
    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    if (users.length > 0) {
      const firstUser = users[0];
      console.log('First user:', {
        id: firstUser._id,
        email: firstUser.email,
        firstName: firstUser.firstName,
        lastName: firstUser.lastName
      });
      
      // Check if there are any reservations for this user
      const reservations = await Reservation.find({ guestId: firstUser._id });
      console.log(`Found ${reservations.length} reservations for user ${firstUser._id}`);
      
      if (reservations.length > 0) {
        console.log('First reservation:', {
          id: reservations[0]._id,
          guestId: reservations[0].guestId,
          roomId: reservations[0].roomId,
          checkIn: reservations[0].checkIn,
          checkOut: reservations[0].checkOut,
          status: reservations[0].status,
          guestCount: reservations[0].guestCount
        });
      }
    }
    
    // Check all reservations
    const allReservations = await Reservation.find({});
    console.log(`Total reservations in database: ${allReservations.length}`);
    
    if (allReservations.length > 0) {
      console.log('All reservations:');
      allReservations.forEach((reservation, index) => {
        console.log(`${index + 1}. ID: ${reservation._id}, GuestID: ${reservation.guestId}, Status: ${reservation.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing bookings:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBookings();
