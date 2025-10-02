const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Reservation = require('./models/Reservation');
const Room = require('./models/Room');
const User = require('./models/User');
require('dotenv').config();

async function convertBookingsToReservations() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('Connected to MongoDB');

    // Find all confirmed bookings that haven't been converted to reservations
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'pending'] }
    }).populate('roomId').populate('guestId');

    console.log(`Found ${bookings.length} bookings to convert`);

    let converted = 0;
    for (const booking of bookings) {
      try {
        // Check if reservation already exists for this booking
        const existingReservation = await Reservation.findOne({
          guestEmail: booking.guestEmail,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          'rooms.roomId': booking.roomId._id
        });

        if (existingReservation) {
          console.log(`Reservation already exists for booking ${booking.bookingReference}`);
          continue;
        }

        // Create reservation from booking
        const reservation = new Reservation({
          guestId: booking.guestId ? booking.guestId._id : null,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          rooms: [{
            roomId: booking.roomId._id,
            roomNumber: booking.roomId.roomNumber,
            roomType: booking.roomId.roomType || booking.roomId.type
          }],
          roomId: booking.roomId._id, // Legacy field
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          checkIn: booking.checkInDate, // Legacy field
          checkOut: booking.checkOutDate, // Legacy field
          totalPrice: booking.totalAmount,
          status: booking.status === 'confirmed' ? 'confirmed' : 'pending',
          paymentStatus: booking.paymentStatus,
          guestCount: {
            adults: booking.numberOfGuests || 1,
            children: 0
          },
          specialRequests: booking.specialRequests,
          source: 'website'
        });

        await reservation.save();
        converted++;
        console.log(`✅ Converted booking ${booking.bookingReference} to reservation ${reservation.reservationId}`);

      } catch (error) {
        console.error(`❌ Error converting booking ${booking.bookingReference}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully converted ${converted} bookings to reservations`);
    console.log('Frontdesk can now manage these reservations for check-in/check-out');

  } catch (error) {
    console.error('Error converting bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the conversion
convertBookingsToReservations();
