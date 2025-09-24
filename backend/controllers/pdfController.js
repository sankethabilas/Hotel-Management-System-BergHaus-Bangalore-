const pdfService = require('../services/pdfService');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Generate and download booking confirmation PDF
// @route   GET /api/pdf/booking/:reservationId
// @access  Private
const downloadBookingConfirmation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.userId || req.user.id;

    console.log('Generating PDF for reservation:', reservationId);
    console.log('User ID:', userId);

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns this reservation (for security)
    if (reservation.guestId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This reservation does not belong to you.'
      });
    }

    // Get room details
    const room = await Room.findById(reservation.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get user details
    const user = await User.findById(reservation.guestId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare booking data for PDF
    const bookingData = {
      bookingReference: `HMS-${reservation._id.toString().slice(-6).toUpperCase()}`,
      guestDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.address?.country || 'Not specified',
        idType: user.idDetails?.idType,
        idNumber: user.idDetails?.idNumber,
        arrivalTime: reservation.arrivalTime || null,
        specialRequests: reservation.specialRequests
      },
      roomDetails: {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities
      },
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      totalAmount: reservation.totalPrice,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      createdAt: reservation.createdAt
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
