const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Room = require('./models/Room');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

async function testReceiptDownload() {
  try {
    console.log('=== TESTING RECEIPT DOWNLOAD FUNCTIONALITY ===');
    
    // Check if there are any bookings
    const bookings = await Booking.find({}).limit(1);
    console.log(`Found ${bookings.length} bookings in database`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found. Cannot test receipt download.');
      return;
    }
    
    const testBooking = bookings[0];
    console.log('Testing with booking:', {
      id: testBooking._id,
      bookingReference: testBooking.bookingReference,
      guestName: testBooking.guestName,
      status: testBooking.status
    });
    
    // Test the PDF service directly
    const pdfService = require('./services/pdfService');
    
    // Get room and user details
    const room = await Room.findById(testBooking.roomId);
    const user = await User.findById(testBooking.guestId);
    
    if (!room || !user) {
      console.log('❌ Missing room or user data for booking');
      return;
    }
    
    // Prepare booking data for PDF
    const bookingData = {
      bookingReference: testBooking.bookingReference,
      guestDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.address?.country || 'Not specified',
        idType: user.idDetails?.idType,
        idNumber: user.idDetails?.idNumber,
        arrivalTime: testBooking.specialRequests || null,
        specialRequests: testBooking.specialRequests
      },
      roomDetails: {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities
      },
      checkIn: testBooking.checkInDate,
      checkOut: testBooking.checkOutDate,
      totalAmount: testBooking.totalAmount,
      status: testBooking.status,
      paymentStatus: testBooking.paymentStatus,
      createdAt: testBooking.createdAt
    };
    
    console.log('Generating PDF...');
    const pdfBuffer = await pdfService.generateBookingConfirmationPDF(bookingData);
    
    console.log('✅ PDF generated successfully!');
    console.log('PDF size:', pdfBuffer.length, 'bytes');
    
    // Test HTML generation
    const htmlContent = pdfService.generateBookingConfirmationHTML(bookingData);
    console.log('✅ HTML content generated successfully!');
    console.log('HTML length:', htmlContent.length, 'characters');
    
  } catch (error) {
    console.error('❌ Error testing receipt download:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    mongoose.connection.close();
  }
}

testReceiptDownload();
