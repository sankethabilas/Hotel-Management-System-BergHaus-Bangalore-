const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
const Room = require('./models/Room');
require('dotenv').config();

async function migrateReservations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('Connected to MongoDB');
    
    // Find all reservations that need migration
    const reservations = await Reservation.find({
      $or: [
        { guestName: { $exists: false } },
        { guestEmail: { $exists: false } },
        { checkInDate: { $exists: false } },
        { checkOutDate: { $exists: false } },
        { reservationId: { $exists: false } }
      ]
    }).populate('guestId').populate('roomId');
    
    console.log(`Found ${reservations.length} reservations to migrate`);
    
    for (const reservation of reservations) {
      let updated = false;
      
      // Migrate guest information
      if (!reservation.guestName && reservation.guestId) {
        reservation.guestName = `${reservation.guestId.firstName} ${reservation.guestId.lastName}`;
        updated = true;
      }
      
      if (!reservation.guestEmail && reservation.guestId) {
        reservation.guestEmail = reservation.guestId.email;
        updated = true;
      }
      
      if (!reservation.guestPhone && reservation.guestId && reservation.guestId.phone) {
        reservation.guestPhone = reservation.guestId.phone;
        updated = true;
      }
      
      // Migrate date fields
      if (!reservation.checkInDate && reservation.checkIn) {
        reservation.checkInDate = reservation.checkIn;
        updated = true;
      }
      
      if (!reservation.checkOutDate && reservation.checkOut) {
        reservation.checkOutDate = reservation.checkOut;
        updated = true;
      }
      
      // Migrate room information to new format
      if ((!reservation.rooms || reservation.rooms.length === 0) && reservation.roomId) {
        reservation.rooms = [{
          roomId: reservation.roomId._id,
          roomNumber: reservation.roomId.roomNumber,
          roomType: reservation.roomId.type
        }];
        updated = true;
      }
      
      // Generate reservation ID if missing
      if (!reservation.reservationId) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        reservation.reservationId = `HMS${timestamp}${random}`;
        updated = true;
      }
      
      // Ensure required fields have defaults
      if (!reservation.guestName) {
        reservation.guestName = 'Guest';
        updated = true;
      }
      
      if (!reservation.guestEmail) {
        reservation.guestEmail = 'guest@example.com';
        updated = true;
      }
      
      if (updated) {
        await reservation.save();
        console.log(`Updated reservation ${reservation._id} - ${reservation.reservationId}`);
      }
    }
    
    console.log('Migration completed successfully');
    
    // Verify the migration
    const totalReservations = await Reservation.countDocuments();
    const migratedReservations = await Reservation.countDocuments({
      guestName: { $exists: true },
      guestEmail: { $exists: true },
      reservationId: { $exists: true }
    });
    
    console.log(`Total reservations: ${totalReservations}`);
    console.log(`Migrated reservations: ${migratedReservations}`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateReservations();

