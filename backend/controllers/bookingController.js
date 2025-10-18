import { Booking } from '../models/bookingModel.js';

// Get all bookings for a specific guest
export async function getGuestBookings(req, res) {
  try {
    const { guestId } = req.params;
    
    if (!guestId) {
      return res.status(400).json({ message: 'guestId is required' });
    }

    const bookings = await Booking.find({ guestId })
      .sort({ checkInDate: -1 })
      .lean();

    // Calculate summary statistics
    const totalStays = bookings.filter(b => b.status === 'checked_out').length;
    const totalSpent = bookings
      .filter(b => b.status === 'checked_out' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      bookings,
      summary: {
        totalStays,
        totalSpent,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    console.error('Error fetching guest bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
}

// Get all bookings (with optional filters)
export async function getAllBookings(req, res) {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.checkInDate = {};
      if (startDate) filter.checkInDate.$gte = new Date(startDate);
      if (endDate) filter.checkInDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .sort({ checkInDate: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
}

// Get booking by ID
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id).lean();
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
}
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

    await booking.save({ session });

    // Update room availability (optional - mark as temporarily reserved)
    // room.isAvailable = false;
    // await room.save({ session });

    await session.commitTransaction();

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

    await booking.save();

    // Send cancellation email
    try {
      await emailService.sendBookingCancellation(booking);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
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
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
      .populate('roomId', 'roomNumber roomType')
      .populate('guestId', 'firstName lastName email')
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


module.exports = {
  searchAvailableRooms,
  createBooking,
  getBookingByReference,
  getUserBookings,
  cancelBooking,
  updateArrivalTime,
  updateBookingStatus,
  getAllBookings
};
