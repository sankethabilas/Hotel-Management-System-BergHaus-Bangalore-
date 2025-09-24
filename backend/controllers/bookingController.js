const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { hasBookingOverlap, formatDateForDisplay, validateBookingDates } = require('../utils/bookingValidation');

// @desc    Create a new booking
// @route   POST /api/booking/create
// @access  Private
const createBooking = async (req, res) => {
  try {
    console.log('=== BOOKING REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    console.log('User ID to use:', req.user.userId || req.user.id);
    
    const {
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
      guestDetails,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !adults || !guestDetails) {
      console.log('Missing required fields:', {
        roomId: !!roomId,
        checkIn: !!checkIn,
        checkOut: !!checkOut,
        adults: !!adults,
        guestDetails: !!guestDetails
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Validate guest details
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      console.log('Missing guest details:', {
        firstName: !!guestDetails.firstName,
        lastName: !!guestDetails.lastName,
        email: !!guestDetails.email,
        phone: !!guestDetails.phone
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required guest information'
      });
    }

    // Check if room exists and is available
    console.log('Looking for room with ID:', roomId);
    const room = await Room.findById(roomId);
    console.log('Room found:', room);
    
    if (!room) {
      console.log('Room not found');
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Validate booking dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const dateValidation = validateBookingDates(checkInDate, checkOutDate);
    if (!dateValidation.success) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message
      });
    }

    console.log('Checking for overlapping reservations...');
    console.log('Requested check-in:', checkInDate.toISOString());
    console.log('Requested check-out:', checkOutDate.toISOString());

    // Find all existing reservations for this room
    const existingReservations = await Reservation.find({
      roomId: room._id,
      status: { $in: ['confirmed', 'pending'] }
    });

    console.log(`Found ${existingReservations.length} existing reservations for room ${room.roomNumber}`);

    // Check for overlaps considering maintenance period
    for (const existingReservation of existingReservations) {
      const existingCheckIn = new Date(existingReservation.checkIn);
      const existingCheckOut = new Date(existingReservation.checkOut);
      
      console.log(`Checking against existing reservation ${existingReservation._id}:`);
      console.log(`  Existing check-in: ${existingCheckIn.toISOString()}`);
      console.log(`  Existing check-out: ${existingCheckOut.toISOString()}`);

      // Use utility function to check for overlap
      const hasOverlap = hasBookingOverlap(
        checkInDate, 
        checkOutDate, 
        existingCheckIn, 
        existingCheckOut, 
        1 // 1-day maintenance period
      );

      if (hasOverlap) {
        console.log('❌ Overlap detected!');
        const maintenanceEndDate = new Date(existingCheckOut);
        maintenanceEndDate.setDate(maintenanceEndDate.getDate() + 1);
        
        return res.status(400).json({
          success: false,
          message: `Room is not available for the selected dates. The room has a booking from ${formatDateForDisplay(existingCheckIn)} to ${formatDateForDisplay(existingCheckOut)} with a 1-day maintenance period. Please select dates after ${formatDateForDisplay(maintenanceEndDate)}.`,
          details: {
            existingBooking: {
              checkIn: existingCheckIn.toISOString(),
              checkOut: existingCheckOut.toISOString(),
              maintenanceEnds: maintenanceEndDate.toISOString()
            },
            requestedDates: {
              checkIn: checkInDate.toISOString(),
              checkOut: checkOutDate.toISOString()
            },
            nextAvailableCheckIn: maintenanceEndDate.toISOString()
          }
        });
      }
    }

    console.log('✅ No overlaps found, booking is allowed');

    // Calculate pricing
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;
    const tax = totalPrice * 0.1; // 10% tax
    const finalPrice = totalPrice + tax;

    // Create reservation
    const reservation = new Reservation({
      guestId: req.user.userId || req.user.id,
      roomId: room._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: finalPrice,
      status: 'confirmed',
      guestCount: {
        adults: parseInt(adults),
        children: parseInt(children || 0)
      },
      specialRequests: specialRequests || guestDetails.specialRequests,
      paymentStatus: 'unpaid'
    });

    console.log('Saving reservation:', reservation);
    await reservation.save();
    console.log('Reservation saved successfully');

    // Update room status to reserved
    console.log('Updating room status to reserved');
    room.status = 'reserved';
    await room.save();
    console.log('Room status updated successfully');

    // Update user profile with ID details if provided
    if (guestDetails.idType && guestDetails.idNumber) {
      try {
        await User.findByIdAndUpdate(req.user.userId || req.user.id, {
          'idDetails.idType': guestDetails.idType,
          'idDetails.idNumber': guestDetails.idNumber,
          // Also update other profile fields if they're different
          firstName: guestDetails.firstName,
          lastName: guestDetails.lastName,
          phone: guestDetails.phone,
          'address.country': guestDetails.country
        });
        console.log('User profile updated with ID details');
      } catch (updateError) {
        console.error('Error updating user profile:', updateError);
        // Don't fail the booking if profile update fails
      }
    }

    const responseData = {
      success: true,
      message: 'Booking created successfully',
      data: {
        reservation: {
          id: reservation._id,
          bookingReference: `HMS-${reservation._id.toString().slice(-6).toUpperCase()}`,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          totalAmount: reservation.totalPrice,
          status: reservation.status,
          guestDetails: {
            firstName: guestDetails.firstName,
            lastName: guestDetails.lastName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            country: guestDetails.country,
            idType: guestDetails.idType,
            idNumber: guestDetails.idNumber,
            arrivalTime: guestDetails.arrivalTime,
            specialRequests: specialRequests || guestDetails.specialRequests
          }
        }
      }
    };
    
    // Send booking confirmation email (async, don't wait for it)
    const bookingEmailData = {
      bookingReference: responseData.data.reservation.bookingReference,
      roomNumber: responseData.data.reservation.roomNumber,
      roomType: responseData.data.reservation.roomType,
      checkIn: responseData.data.reservation.checkIn,
      checkOut: responseData.data.reservation.checkOut,
      totalAmount: responseData.data.reservation.totalAmount,
      status: responseData.data.reservation.status
    };
    
    // Fetch user for email sending
    const user = await User.findById(req.user.userId || req.user.id);
    if (user) {
      emailService.sendBookingConfirmationEmail(user, bookingEmailData).catch(error => {
        console.error('Failed to send booking confirmation email:', error);
        // Don't fail the booking if email fails
      });
    } else {
      console.log('User not found for email sending');
    }
    
    console.log('Sending success response:', responseData);
    res.status(201).json(responseData);

  } catch (error) {
    console.error('=== BOOKING ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END BOOKING ERROR ===');
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get booking details
// @route   GET /api/booking/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('roomId', 'roomNumber roomType pricePerNight amenities')
      .populate('userId', 'firstName lastName email phone');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (reservation.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        reservation: {
          id: reservation._id,
          bookingReference: `HMS-${reservation._id.toString().slice(-6).toUpperCase()}`,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          adults: reservation.adults,
          children: reservation.children,
          totalNights: reservation.totalNights,
          pricePerNight: reservation.pricePerNight,
          subtotal: reservation.subtotal,
          tax: reservation.tax,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          guestDetails: reservation.guestDetails,
          room: reservation.roomId,
          user: reservation.userId,
          createdAt: reservation.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/booking/user/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id })
      .populate('roomId', 'roomNumber roomType pricePerNight amenities')
      .sort({ createdAt: -1 });

    const bookings = reservations.map(reservation => ({
      id: reservation._id,
      bookingReference: `HMS-${reservation._id.toString().slice(-6).toUpperCase()}`,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      adults: reservation.adults,
      children: reservation.children,
      totalNights: reservation.totalNights,
      totalAmount: reservation.totalAmount,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      room: reservation.roomId,
      createdAt: reservation.createdAt
    }));

    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createBooking,
  getBooking,
  getUserBookings
};
