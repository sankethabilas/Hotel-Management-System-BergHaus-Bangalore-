const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const emailService = require('../services/emailService');

// @desc    Search available rooms
// @route   POST /api/bookings/search
// @access  Public
const searchAvailableRooms = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { checkInDate, checkOutDate, roomType, guests } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn < now) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Build room filter
    const roomFilter = {};
    if (roomType) {
      roomFilter.roomType = roomType;
    }
    if (guests) {
      roomFilter.capacity = { $gte: guests };
    }

    // Get all rooms matching the filter
    const allRooms = await Room.find(roomFilter);
    const roomIds = allRooms.map(room => room._id);

    if (roomIds.length === 0) {
      return res.json({
        success: true,
        message: 'No rooms found matching your criteria',
        data: {
          availableRooms: [],
          totalRooms: 0,
          searchCriteria: {
            checkInDate,
            checkOutDate,
            roomType,
            guests
          }
        }
      });
    }

    // Find available rooms (no overlapping bookings)
    const availableRoomIds = await Booking.findAvailableRooms(roomIds, checkIn, checkOut);

    // Get full room details for available rooms
    const availableRooms = await Room.find({
      _id: { $in: availableRoomIds }
    }).sort({ roomNumber: 1 });

    // Calculate pricing for each room
    const roomsWithPricing = availableRooms.map(room => {
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const basePrice = room.pricePerNight || 100; // Default price if not set
      const totalPrice = basePrice * nights;
      const tax = totalPrice * 0.1; // 10% tax
      const finalPrice = totalPrice + tax;

      return {
        ...room.toObject(),
        pricing: {
          pricePerNight: basePrice,
          totalNights: nights,
          subtotal: totalPrice,
          tax: tax,
          total: finalPrice
        }
      };
    });

    res.json({
      success: true,
      message: 'Available rooms found',
      data: {
        availableRooms: roomsWithPricing,
        totalRooms: roomsWithPricing.length,
        searchCriteria: {
          checkInDate,
          checkOutDate,
          roomType,
          guests
        }
      }
    });

  } catch (error) {
    console.error('Search available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      guestIdPassport,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      paymentMethod
    } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn < now) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get room details
    const room = await Room.findById(roomId).session(session);
    if (!room) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is still available (double-check for race conditions)
    const isAvailable = await Booking.findAvailableRooms([roomId], checkIn, checkOut);
    if (!isAvailable.includes(roomId.toString())) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'Room is no longer available for the selected dates'
      });
    }

    // Check room capacity
    if (numberOfGuests > room.capacity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${room.capacity} guests, but ${numberOfGuests} guests requested`
      });
    }

    // Find or create guest user
    let guest;
    
    // If user is authenticated, use their ID
    if (req.user && req.user.id) {
      guest = await User.findById(req.user.id).session(session);
      if (!guest) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Authenticated user not found'
        });
      }
    } else {
      // For non-authenticated users, find or create by email
      guest = await User.findOne({ email: guestEmail }).session(session);
      if (!guest) {
        guest = new User({
          firstName: guestName.split(' ')[0] || guestName,
          lastName: guestName.split(' ').slice(1).join(' ') || '',
          email: guestEmail,
          phone: guestPhone,
          role: 'guest',
          isActive: true
        });
        await guest.save({ session });
      }
    }

    // Calculate pricing
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = room.pricePerNight || 100;
    const subtotal = roomPrice * nights;
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;
    
    // Ensure we have valid amounts
    if (!totalAmount || totalAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid booking amount calculated'
      });
    }

    // Create booking
    const booking = new Booking({
      roomId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      guestId: guest._id,
      guestName,
      guestEmail,
      guestPhone,
      guestIdPassport,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      totalNights: nights,
      roomPrice,
      totalAmount,
      taxAmount: tax,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      specialRequests
    });

    console.log('Creating booking with pricing:', {
      roomPrice,
      totalAmount,
      taxAmount: tax,
      totalNights: nights
    });

    await booking.save({ session });

    // Update room availability (optional - mark as temporarily reserved)
    // room.isAvailable = false;
    // await room.save({ session });

    await session.commitTransaction();

    // Create corresponding reservation for frontdesk operations
    try {
      const Reservation = require('../models/Reservation');
      
      const reservation = new Reservation({
        guestId: guest._id,
        guestName,
        guestEmail,
        guestPhone,
        rooms: [{
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType || room.type
        }],
        roomId: room._id, // Legacy field
        checkInDate: checkIn,
        checkOutDate: checkOut,
        checkIn: checkIn, // Legacy field
        checkOut: checkOut, // Legacy field
        totalPrice: totalAmount,
        status: 'confirmed', // Auto-confirm bookings from website
        paymentStatus: 'unpaid',
        guestCount: {
          adults: numberOfGuests || 1,
          children: 0
        },
        specialRequests,
        source: 'website'
      });

      await reservation.save();
      console.log(`✅ Created reservation ${reservation.reservationId} for booking ${booking.bookingReference}`);
    } catch (reservationError) {
      console.error('Failed to create reservation for booking:', reservationError);
      // Don't fail the booking if reservation creation fails
    }

    // Send confirmation email
    try {
      await emailService.sendBookingConfirmation(booking);
      booking.confirmationEmailSent = true;
      await booking.save();
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: booking,
        bookingReference: booking.bookingReference
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get booking by reference
// @route   GET /api/bookings/:reference
// @access  Public
const getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({ bookingReference: reference })
      .populate('roomId', 'roomNumber roomType capacity amenities')
      .populate('guestId', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('Retrieved booking pricing data:', {
      roomPrice: booking.roomPrice,
      totalAmount: booking.totalAmount,
      taxAmount: booking.taxAmount,
      totalNights: booking.totalNights
    });

    res.json({
      success: true,
      message: 'Booking found',
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/booking/user/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    const bookings = await Booking.find({ guestId: userId })
      .populate('roomId', 'roomNumber roomType capacity amenities')
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      message: 'User bookings retrieved',
      data: { bookings }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Cancel booking
// @route   POST /api/booking/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Debug logging
    console.log('Cancel booking request:', { id, reason, user: req.user });
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('No user found in request:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const userId = req.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      console.log('Booking not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('Booking found:', { 
      bookingId: booking._id, 
      guestId: booking.guestId, 
      userId, 
      status: booking.status 
    });

    // Check if user owns this booking
    if (booking.guestId.toString() !== userId.toString()) {
      console.log('User does not own this booking:', { 
        bookingGuestId: booking.guestId.toString(), 
        userId: userId.toString() 
      });
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    // Check if booking can be cancelled (within 24 hours of booking confirmation)
    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const hoursSinceBooking = (now - bookingTime) / (1000 * 60 * 60);
    
    if (hoursSinceBooking > 24) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be canceled online. Please contact the hotel. Cancellation charges may apply.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason || 'Cancelled by guest';

    console.log('Saving booking with status:', booking.status);
    await booking.save();
    console.log('Booking saved successfully');

    // Send cancellation email
    try {
      console.log('Sending cancellation email for booking:', booking._id);
      await emailService.sendBookingCancellation(booking);
      console.log('Cancellation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount: booking.totalAmount // Full refund within 24 hours
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update booking arrival time
// @route   PUT /api/booking/:id/arrival-time
// @access  Private
const updateArrivalTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { arrivalTime } = req.body;
    const userId = req.user.id; // Get from authenticated user

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.guestId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own bookings'
      });
    }

    // Check if booking is still active
    if (booking.status === 'cancelled' || booking.status === 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update arrival time for cancelled or checked-out bookings'
      });
    }

    // Update arrival time
    booking.arrivalTime = arrivalTime;
    await booking.save();

    res.json({
      success: true,
      message: 'Arrival time updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update arrival time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (status) {
      booking.status = status;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin/Staff)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'bookingDate', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Add custom charges to booking
// @route   POST /api/bookings/:id/charges
// @access  Private (Staff/Admin)
const addCustomCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const { charges } = req.body;

    console.log('Adding custom charges:', { id, charges });

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    if (!charges || !Array.isArray(charges) || charges.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charges data'
      });
    }

    // Validate each charge
    for (const charge of charges) {
      if (!charge.description || !charge.quantity || !charge.unitPrice) {
        return res.status(400).json({
          success: false,
          message: 'Each charge must have description, quantity, and unitPrice'
        });
      }
      if (charge.quantity <= 0 || charge.unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity or price values'
        });
      }
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('Found booking:', booking.bookingReference);

    // Initialize customCharges if it doesn't exist
    if (!booking.customCharges) {
      booking.customCharges = [];
    }
    
    // Add new charges
    booking.customCharges.push(...charges);
    
    // Recalculate total amount safely
    const roomCharges = (booking.roomPrice || 0) * (booking.totalNights || 1);
    const taxAmount = booking.taxAmount || 0;
    const customChargesTotal = booking.customCharges.reduce((total, charge) => {
      return total + ((charge.quantity || 0) * (charge.unitPrice || 0));
    }, 0);
    
    booking.totalAmount = roomCharges + taxAmount + customChargesTotal;
    
    console.log('Calculated totals:', {
      roomCharges,
      taxAmount,
      customChargesTotal,
      newTotal: booking.totalAmount
    });
    
    await booking.save();

    res.json({
      success: true,
      message: 'Custom charges added successfully',
      data: {
        booking,
        newTotal: booking.totalAmount
      }
    });

  } catch (error) {
    console.error('Add custom charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Generate bill for booking
// @route   GET /api/bookings/:id/bill
// @access  Private (Staff/Admin)
const generateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query; // 'json' or 'pdf'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate bill details safely
    const roomCharges = (booking.roomPrice || 0) * (booking.totalNights || 1);
    const customChargesTotal = booking.customCharges ? booking.customCharges.reduce((total, charge) => {
      return total + ((charge.quantity || 0) * (charge.unitPrice || 0));
    }, 0) : 0;
    
    const subtotal = roomCharges + customChargesTotal;
    const tax = booking.taxAmount || 0;
    const total = subtotal + tax;

    const billData = {
      billId: `BILL-${booking.bookingReference}`,
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      roomNumber: booking.roomNumber,
      roomType: booking.roomType,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalNights: booking.totalNights || 1,
      items: [
        {
          description: `Room Charges (${booking.totalNights || 1} nights)`,
          quantity: booking.totalNights || 1,
          unitPrice: booking.roomPrice || 0,
          total: roomCharges
        },
        ...(booking.customCharges || []).map(charge => ({
          description: charge.description,
          quantity: charge.quantity,
          unitPrice: charge.unitPrice,
          total: (charge.quantity || 0) * (charge.unitPrice || 0)
        }))
      ],
      subtotal,
      tax,
      total,
      paymentStatus: booking.paymentStatus,
      createdAt: new Date()
    };

    if (format === 'pdf') {
      // Generate PDF
      const pdfService = require('../services/pdfService');
      const pdfBuffer = await pdfService.generateBillPDF(billData);
      
      // Ensure proper headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bill-${booking.bookingReference}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send the buffer
      res.end(pdfBuffer);
    } else {
      // Return JSON data
      res.json({
        success: true,
        message: 'Bill generated successfully',
        data: {
          bill: billData
        }
      });
    }

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// @desc    Send bill via email
// @route   POST /api/bookings/:id/bill/email
// @access  Private (Staff/Admin)
const sendBillEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate bill details safely
    const roomCharges = (booking.roomPrice || 0) * (booking.totalNights || 1);
    const customChargesTotal = booking.customCharges ? booking.customCharges.reduce((total, charge) => {
      return total + ((charge.quantity || 0) * (charge.unitPrice || 0));
    }, 0) : 0;
    
    const subtotal = roomCharges + customChargesTotal;
    const tax = booking.taxAmount || 0;
    const total = subtotal + tax;

    const billData = {
      billId: `BILL-${booking.bookingReference}`,
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      roomNumber: booking.roomNumber,
      roomType: booking.roomType,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalNights: booking.totalNights || 1,
      items: [
        {
          description: `Room Charges (${booking.totalNights || 1} nights)`,
          quantity: booking.totalNights || 1,
          unitPrice: booking.roomPrice || 0,
          total: roomCharges
        },
        ...(booking.customCharges || []).map(charge => ({
          description: charge.description,
          quantity: charge.quantity,
          unitPrice: charge.unitPrice,
          total: (charge.quantity || 0) * (charge.unitPrice || 0)
        }))
      ],
      subtotal,
      tax,
      total,
      paymentStatus: booking.paymentStatus,
      createdAt: new Date()
    };

    // Generate PDF
    const pdfService = require('../services/pdfService');
    const pdfBuffer = await pdfService.generateBillPDF(billData);
    
    // Send email with PDF attachment
    const emailService = require('../services/emailService');
    await emailService.sendBillEmail(billData, pdfBuffer);

    res.json({
      success: true,
      message: 'Bill sent via email successfully',
      data: {
        billId: billData.billId,
        sentTo: billData.guestEmail
      }
    });

  } catch (error) {
    console.error('Send bill email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  searchAvailableRooms,
  createBooking,
  getBookingByReference,
  getUserBookings,
  cancelBooking,
  updateArrivalTime,
  updateBookingStatus,
  getAllBookings,
  addCustomCharges,
  generateBill,
  sendBillEmail
};