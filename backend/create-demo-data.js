const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Room = require('./models/Room');
const User = require('./models/User');
const Reservation = require('./models/Reservation');

// Connect to database
connectDB();

/**
 * Create demo data for testing the reservation system
 */
async function createDemoData() {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await Room.deleteMany({});
    await Reservation.deleteMany({});
    
    console.log('🏨 Creating demo rooms...');
    
    // Create demo rooms
    const demoRooms = [
      {
        roomNumber: '101',
        roomType: 'Single',
        pricePerNight: 5000,
        capacity: 1,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
        description: 'Comfortable single room with mountain view',
        images: ['/images/room-101-1.jpg', '/images/room-101-2.jpg']
      },
      {
        roomNumber: '102',
        roomType: 'Single',
        pricePerNight: 5500,
        capacity: 1,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Balcony'],
        description: 'Single room with private balcony and garden view',
        images: ['/images/room-102-1.jpg']
      },
      {
        roomNumber: '201',
        roomType: 'Double',
        pricePerNight: 8000,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar'],
        description: 'Spacious double room perfect for couples',
        images: ['/images/room-201-1.jpg', '/images/room-201-2.jpg']
      },
      {
        roomNumber: '202',
        roomType: 'Double',
        pricePerNight: 8500,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Balcony', 'Mountain View'],
        description: 'Double room with stunning mountain views',
        images: ['/images/room-202-1.jpg']
      },
      {
        roomNumber: '301',
        roomType: 'Suite',
        pricePerNight: 15000,
        capacity: 4,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Living Area', 'Kitchenette', 'Balcony', 'Mountain View'],
        description: 'Luxury suite with separate living area and kitchenette',
        images: ['/images/room-301-1.jpg', '/images/room-301-2.jpg', '/images/room-301-3.jpg']
      },
      {
        roomNumber: '302',
        roomType: 'Suite',
        pricePerNight: 18000,
        capacity: 6,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Living Area', 'Kitchenette', 'Balcony', 'Mountain View', 'Jacuzzi'],
        description: 'Premium suite with jacuzzi and panoramic mountain views',
        images: ['/images/room-302-1.jpg', '/images/room-302-2.jpg']
      }
    ];
    
    const createdRooms = await Room.insertMany(demoRooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);
    
    // Find a guest user for demo reservations
    const guestUser = await User.findOne({ role: 'guest' });
    
    if (guestUser) {
      console.log('📅 Creating demo reservations...');
      
      // Create demo reservations
      const demoReservations = [
        {
          guestId: guestUser._id,
          roomId: createdRooms[0]._id, // Room 101
          checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          totalPrice: 15000, // 3 nights * 5000
          status: 'confirmed',
          paymentStatus: 'paid',
          guestCount: { adults: 1, children: 0 },
          specialRequests: 'Please provide extra towels'
        },
        {
          guestId: guestUser._id,
          roomId: createdRooms[2]._id, // Room 201
          checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
          totalPrice: 24000, // 3 nights * 8000
          status: 'pending',
          paymentStatus: 'unpaid',
          guestCount: { adults: 2, children: 0 },
          specialRequests: 'Anniversary celebration'
        },
        {
          guestId: guestUser._id,
          roomId: createdRooms[4]._id, // Room 301
          checkIn: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          checkOut: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          totalPrice: 60000, // 4 nights * 15000
          status: 'confirmed',
          paymentStatus: 'paid',
          guestCount: { adults: 2, children: 2 },
          specialRequests: 'Family vacation with young children'
        }
      ];
      
      const createdReservations = await Reservation.insertMany(demoReservations);
      console.log(`✅ Created ${createdReservations.length} reservations`);
      
      // Update room statuses based on reservations
      await Room.findByIdAndUpdate(createdRooms[0]._id, { status: 'reserved' });
      await Room.findByIdAndUpdate(createdRooms[2]._id, { status: 'reserved' });
      await Room.findByIdAndUpdate(createdRooms[4]._id, { status: 'reserved' });
      
      console.log('✅ Updated room statuses');
    } else {
      console.log('⚠️  No guest user found. Please create a guest user first.');
    }
    
    console.log('\n🎉 Demo data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdRooms.length} rooms created`);
    console.log(`   - Room types: ${[...new Set(createdRooms.map(r => r.roomType))].join(', ')}`);
    console.log(`   - Price range: LKR ${Math.min(...createdRooms.map(r => r.pricePerNight))} - LKR ${Math.max(...createdRooms.map(r => r.pricePerNight))}`);
    
    if (guestUser) {
      console.log(`   - ${createdReservations.length} demo reservations created`);
    }
    
    console.log('\n🔗 Test the API endpoints:');
    console.log('   GET /api/rooms - Get all rooms');
    console.log('   GET /api/rooms/available - Get available rooms');
    console.log('   GET /api/rooms/type/Double - Get double rooms');
    console.log('   GET /api/rooms/availability?checkIn=2024-10-01&checkOut=2024-10-05 - Check availability');
    console.log('   POST /api/reservations - Create reservation (requires auth)');
    console.log('   GET /api/reservations - Get all reservations (admin only)');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createDemoData();
