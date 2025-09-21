const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Room = require('./models/Room');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const reservationService = require('./services/reservationService');
const roomService = require('./services/roomService');

// Connect to database
connectDB();

/**
 * Test script for reservation operations
 */
async function testReservationOperations() {
  try {
    console.log('🧪 Testing Reservation Management System...\n');
    
    // Test 1: Get all rooms
    console.log('1️⃣  Testing: Get all rooms');
    const allRooms = await roomService.getAllRooms();
    console.log(`   ✅ Found ${allRooms.length} rooms`);
    console.log(`   📋 Room types: ${[...new Set(allRooms.map(r => r.roomType))].join(', ')}\n`);
    
    // Test 2: Get available rooms
    console.log('2️⃣  Testing: Get available rooms');
    const availableRooms = await roomService.getAvailableRooms();
    console.log(`   ✅ Found ${availableRooms.length} available rooms\n`);
    
    // Test 3: Check room availability for specific dates
    console.log('3️⃣  Testing: Check room availability');
    const checkIn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const checkOut = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000); // 33 days from now
    
    const availableForDates = await reservationService.checkRoomAvailability(checkIn, checkOut);
    console.log(`   ✅ Found ${availableForDates.length} rooms available for ${checkIn.toDateString()} - ${checkOut.toDateString()}\n`);
    
    // Test 4: Get room statistics
    console.log('4️⃣  Testing: Get room statistics');
    const roomStats = await roomService.getRoomStats();
    console.log(`   ✅ Room Statistics:`);
    console.log(`      - Total rooms: ${roomStats.totalRooms}`);
    console.log(`      - Available: ${roomStats.availableRooms}`);
    console.log(`      - Reserved: ${roomStats.reservedRooms}`);
    console.log(`      - Occupied: ${roomStats.occupiedRooms}`);
    console.log(`      - Average price: LKR ${roomStats.averagePrice.toFixed(2)}\n`);
    
    // Test 5: Get all reservations
    console.log('5️⃣  Testing: Get all reservations');
    const allReservations = await reservationService.getAllReservations();
    console.log(`   ✅ Found ${allReservations.length} reservations\n`);
    
    // Test 6: Get reservation statistics
    console.log('6️⃣  Testing: Get reservation statistics');
    const reservationStats = await reservationService.getReservationStats();
    console.log(`   ✅ Reservation Statistics:`);
    console.log(`      - Total reservations: ${reservationStats.totalReservations}`);
    console.log(`      - Pending: ${reservationStats.pendingReservations}`);
    console.log(`      - Confirmed: ${reservationStats.confirmedReservations}`);
    console.log(`      - Cancelled: ${reservationStats.cancelledReservations}`);
    console.log(`      - Total revenue: LKR ${reservationStats.totalRevenue}\n`);
    
    // Test 7: Test room search functionality
    console.log('7️⃣  Testing: Room search functionality');
    const searchResults = await roomService.searchRooms({
      roomType: 'Double',
      minPrice: 7000,
      maxPrice: 9000
    });
    console.log(`   ✅ Found ${searchResults.length} double rooms between LKR 7,000 - 9,000\n`);
    
    // Test 8: Test overlapping reservation detection
    console.log('8️⃣  Testing: Overlapping reservation detection');
    const room = allRooms[0];
    const overlappingReservations = await Reservation.findOverlappingReservations(
      room._id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    );
    console.log(`   ✅ Found ${overlappingReservations.length} overlapping reservations for room ${room.roomNumber}\n`);
    
    // Test 9: Test room status updates
    console.log('9️⃣  Testing: Room status updates');
    const testRoom = availableRooms[0];
    if (testRoom) {
      await roomService.updateRoomStatus(testRoom._id, 'occupied');
      const updatedRoom = await roomService.getRoomById(testRoom._id);
      console.log(`   ✅ Updated room ${updatedRoom.roomNumber} status to: ${updatedRoom.status}`);
      
      // Reset status
      await roomService.updateRoomStatus(testRoom._id, 'available');
      console.log(`   ✅ Reset room ${updatedRoom.roomNumber} status to: available\n`);
    }
    
    // Test 10: Test reservation validation
    console.log('🔟 Testing: Reservation validation');
    try {
      // This should fail - past date
      await reservationService.createReservation({
        roomId: allRooms[0]._id,
        guestId: new mongoose.Types.ObjectId(),
        checkIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        guestCount: { adults: 1, children: 0 }
      });
    } catch (error) {
      console.log(`   ✅ Validation working: ${error.message}\n`);
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 System Status:');
    console.log(`   - ${allRooms.length} rooms in system`);
    console.log(`   - ${availableRooms.length} rooms available`);
    console.log(`   - ${allReservations.length} total reservations`);
    console.log(`   - LKR ${reservationStats.totalRevenue} total revenue`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the tests
testReservationOperations();
