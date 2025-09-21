const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// @desc    Check room availability for date range
// @route   GET /api/availability
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, adults, children } = req.query;

    // Validate required parameters
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    // Parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Calculate total guests
    const totalGuests = parseInt(adults || 1) + parseInt(children || 0);

    // Build room filter
    const roomFilter = { status: 'available' };
    if (roomType && roomType !== 'all') {
      roomFilter.roomType = roomType;
    }

    // Get all available rooms
    const allRooms = await Room.find(roomFilter);

    // Check availability for each room
    const availableRooms = [];

    for (const room of allRooms) {
      // Check if room has sufficient capacity
      if (room.capacity < totalGuests) {
        continue;
      }

      // Check for overlapping reservations
      const overlappingReservations = await Reservation.find({
        roomId: room._id,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          {
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }
        ]
      });

      // If no overlapping reservations, room is available
      if (overlappingReservations.length === 0) {
        // Calculate number of nights
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        // Calculate total price
        const totalPrice = nights * room.pricePerNight;
        
        // Add tax (10%)
        const tax = totalPrice * 0.1;
        const finalPrice = totalPrice + tax;

        availableRooms.push({
          ...room.toObject(),
          nights,
          totalPrice,
          tax,
          finalPrice
        });
      }
    }

    // Group rooms by type for better organization
    const roomsByType = availableRooms.reduce((acc, room) => {
      if (!acc[room.roomType]) {
        acc[room.roomType] = [];
      }
      acc[room.roomType].push(room);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
        totalGuests,
        availableRooms,
        roomsByType,
        totalAvailable: availableRooms.length
      }
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get room availability calendar data
// @route   GET /api/availability/calendar
// @access  Public
const getAvailabilityCalendar = async (req, res) => {
  try {
    const { roomType, month, year } = req.query;
    
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    // Get start and end of month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    // Build room filter
    const roomFilter = { status: 'available' };
    if (roomType && roomType !== 'all') {
      roomFilter.roomType = roomType;
    }
    
    // Get all rooms of the specified type
    const rooms = await Room.find(roomFilter);
    
    // Get all reservations for these rooms in the month
    const reservations = await Reservation.find({
      roomId: { $in: rooms.map(room => room._id) },
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lte: endDate },
          checkOut: { $gte: startDate }
        }
      ]
    }).populate('roomId', 'roomNumber roomType');
    
    // Create calendar data
    const calendarData = {};
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetYear, targetMonth - 1, day);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Count available rooms for this date
      let availableCount = 0;
      const roomAvailability = {};
      
      for (const room of rooms) {
        const isBooked = reservations.some(reservation => {
          const checkIn = new Date(reservation.checkIn);
          const checkOut = new Date(reservation.checkOut);
          return currentDate >= checkIn && currentDate < checkOut;
        });
        
        if (!isBooked) {
          availableCount++;
        }
        
        roomAvailability[room.roomNumber] = !isBooked;
      }
      
      calendarData[dateString] = {
        available: availableCount > 0,
        availableCount,
        totalRooms: rooms.length,
        roomAvailability
      };
    }
    
    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        calendarData,
        rooms: rooms.map(room => ({
          _id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          pricePerNight: room.pricePerNight
        }))
      }
    });
    
  } catch (error) {
    console.error('Calendar data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Book a room
// @route   POST /api/availability/book
// @access  Private
const bookRoom = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !guestCount) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in, check-out dates, and guest count are required'
      });
    }

    // Parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Get room details
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is available
    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }

    // Check capacity
    const totalGuests = guestCount.adults + guestCount.children;
    if (room.capacity < totalGuests) {
      return res.status(400).json({
        success: false,
        message: 'Room capacity exceeded'
      });
    }

    // Check for overlapping reservations
    const overlappingReservations = await Reservation.find({
      roomId: roomId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate pricing
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;
    const tax = totalPrice * 0.1;
    const finalPrice = totalPrice + tax;

    // Create reservation
    const reservation = new Reservation({
      guestId: userId,
      roomId: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: finalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      guestCount: guestCount,
      specialRequests: specialRequests || ''
    });

    await reservation.save();

    // Update room status to reserved
    room.status = 'reserved';
    await room.save();

    // Populate reservation data for response
    await reservation.populate([
      { path: 'guestId', select: 'firstName lastName email' },
      { path: 'roomId', select: 'roomNumber roomType pricePerNight' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Room booked successfully',
      data: {
        reservation: reservation.toObject(),
        pricing: {
          nights,
          pricePerNight: room.pricePerNight,
          subtotal: totalPrice,
          tax,
          total: finalPrice
        }
      }
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  checkAvailability,
  getAvailabilityCalendar,
  bookRoom
};
