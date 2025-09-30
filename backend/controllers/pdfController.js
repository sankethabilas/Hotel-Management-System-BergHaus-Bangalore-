const pdfService = require('../services/pdfService');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Generate and download booking confirmation PDF
// @route   GET /api/pdf/booking/:bookingId
// @access  Private
const downloadBookingConfirmation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId || req.user.id;

    console.log('Generating PDF for booking:', bookingId);
    console.log('User ID:', userId);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking (for security)
    if (booking.guestId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking does not belong to you.'
      });
    }

    // Get room details
    const room = await Room.findById(booking.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get user details
    const user = await User.findById(booking.guestId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare booking data for PDF
    const bookingData = {
      bookingReference: booking.bookingReference,
      guestDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.address?.country || 'Not specified',
        idType: user.idDetails?.idType,
        idNumber: user.idDetails?.idNumber,
        arrivalTime: booking.specialRequests || null,
        specialRequests: booking.specialRequests
      },
      roomDetails: {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities
      },
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    };

    console.log('Generating PDF with data:', bookingData);

    // Generate PDF
    const pdfBuffer = await pdfService.generateBookingConfirmationPDF(bookingData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="booking-confirmation-${bookingData.bookingReference}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    console.log('PDF generated and sent successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Generate PDF from booking data (for booking success page)
// @route   POST /api/pdf/booking/generate
// @access  Private
const generateBookingPDF = async (req, res) => {
  try {
    const bookingData = req.body;
    const userId = req.user.userId || req.user.id;

    console.log('Generating PDF from booking data:', bookingData);

    // Generate PDF
    const pdfBuffer = await pdfService.generateBookingConfirmationPDF(bookingData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="booking-confirmation-${bookingData.bookingReference}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    console.log('PDF generated and sent successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  downloadBookingConfirmation,
  generateBookingPDF
};
