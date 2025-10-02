const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const Room = require('./models/Room');
require('dotenv').config();

async function fixReservationRooms() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('Connected to MongoDB');

    // Find reservations that have roomId but no rooms array
    const reservationsToFix = await Reservation.find({
      roomId: { $exists: true, $ne: null },
      $or: [
        { rooms: { $exists: false } },
        { rooms: { $size: 0 } }
      ]
    }).populate('roomId');

    console.log(`Found ${reservationsToFix.length} reservations to fix`);

    let fixed = 0;
    for (const reservation of reservationsToFix) {
      if (reservation.roomId) {
        const room = reservation.roomId;
        
        // Create rooms array from legacy roomId
        reservation.rooms = [{
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.type || room.roomType
        }];

        await reservation.save();
        fixed++;
        console.log(`Fixed reservation ${reservation._id} - added room ${room.roomNumber}`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} reservations`);
    console.log('All reservations now have proper room assignments');

  } catch (error) {
    console.error('Error fixing reservations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixReservationRooms();
