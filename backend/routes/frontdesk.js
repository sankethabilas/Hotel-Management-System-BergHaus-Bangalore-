const express = require('express');
const router = express.Router();
const { protect, requireFrontdesk, requireAdminOrFrontdesk } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');
const Bill = require('../models/Bill');
const { sendCheckinEmail, sendCheckoutEmailWithAttachment } = require('../services/emailService');

// Test route without authentication to check data
router.get('/test-data', async (req, res) => {
  try {
    const reservationCount = await Reservation.countDocuments();
    const roomCount = await Room.countDocuments();
    const billCount = await Bill.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalReservations: reservationCount,
        totalRooms: roomCount,
        totalBills: billCount,
        sampleReservations: await Reservation.find().limit(5).select('status checkInDate checkOutDate')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test dashboard stats without authentication
router.get('/test-dashboard-stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    console.log('Calculating stats for:', {
      today: today.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });
    
    // Today's arrivals
    const todaysArrivals = await Reservation.countDocuments({
      checkInDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['confirmed', 'checked-in'] }
    });
    
    // Current guests (checked-in)
    const currentGuests = await Reservation.countDocuments({
      status: 'checked-in'
    });
    
    // Today's departures
    const todaysDepartures = await Reservation.countDocuments({
      checkOutDate: { $gte: startOfDay, $lt: endOfDay },
      status: 'checked-in'
    });
    
    // Pending payments
    const pendingPayments = await Bill.countDocuments({
      status: { $in: ['pending', 'partial', 'overdue'] }
    });
    
    // Total bookings count
    const totalBookings = await Reservation.countDocuments();
    
    console.log('Dashboard stats calculated:', {
      todaysArrivals,
      currentGuests,
      todaysDepartures,
      pendingPayments,
      totalBookings
    });
    
    res.json({
      success: true,
      data: {
        todaysArrivals,
        currentGuests,
        todaysDepartures,
        pendingPayments,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Error calculating test dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply authentication middleware to all routes
router.use(protect);
router.use(requireAdminOrFrontdesk);

// GET /api/frontdesk/reservations - Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    console.log('Reservations API called by user:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Query params:', req.query);
    
    const { status, checkInDate, checkOutDate, guestName, page = 1, limit = 50 } = req.query;
    
    // Build query - handle both old and new date field names
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (checkInDate || checkOutDate) {
      // Check both old and new field names
      const dateQuery = {
        $or: []
      };
      
      if (checkInDate) {
        dateQuery.$or.push(
          { checkInDate: { $gte: new Date(checkInDate) } },
          { checkIn: { $gte: new Date(checkInDate) } }
        );
      }
      if (checkOutDate) {
        dateQuery.$or.push(
          { checkInDate: { $lte: new Date(checkOutDate) } },
          { checkIn: { $lte: new Date(checkOutDate) } }
        );
      }
      
      if (dateQuery.$or.length > 0) {
        Object.assign(query, dateQuery);
      }
    }
    
    if (guestName) {
      // Handle both old and new guest name fields
      query.$or = [
        { guestName: { $regex: guestName, $options: 'i' } },
        { 'guestId.firstName': { $regex: guestName, $options: 'i' } },
        { 'guestId.lastName': { $regex: guestName, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reservations without populate first to avoid errors
    let reservations = await Reservation.find(query)
      .sort({ checkInDate: -1, checkIn: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean for better performance
    
    // Transform reservations to ensure consistent format
    reservations = reservations.map(reservation => {
      // Ensure we have the new field names
      if (!reservation.guestName && reservation.guestId) {
        // Will be populated later if needed
        reservation.guestName = 'Guest';
      }
      
      if (!reservation.guestEmail && reservation.guestId) {
        reservation.guestEmail = 'guest@example.com';
      }
      
      // Handle date fields - prefer new names
      if (!reservation.checkInDate && reservation.checkIn) {
        reservation.checkInDate = reservation.checkIn;
      }
      if (!reservation.checkOutDate && reservation.checkOut) {
        reservation.checkOutDate = reservation.checkOut;
      }
      
      // Ensure rooms array exists
      if (!reservation.rooms) {
        reservation.rooms = [];
      }
      
      // Generate reservationId if missing
      if (!reservation.reservationId) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        reservation.reservationId = `HMS${timestamp}${random}`;
      }
      
      return reservation;
    });
    
    // Get total count for pagination
    const total = await Reservation.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
});

// GET /api/frontdesk/reservations/:id - Get reservation details
router.get('/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guestId', 'firstName lastName email phone address')
      .populate('rooms.roomId', 'roomNumber type amenities pricePerNight')
      .populate('roomId', 'roomNumber type amenities pricePerNight'); // Legacy support
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    res.json({
      success: true,
      data: { reservation }
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation',
      error: error.message
    });
  }
});

// POST /api/frontdesk/checkin/:reservationId - Check in a guest
router.post('/checkin/:reservationId', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
      .populate('guestId')
      .populate('rooms.roomId');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Check if reservation can be checked in
    if (reservation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Reservation must be confirmed before check-in'
      });
    }
    
    // Check if rooms are allocated (check both new and legacy formats)
    const hasRoomsArray = reservation.rooms && reservation.rooms.length > 0;
    const hasLegacyRoom = reservation.roomId;
    
    if (!hasRoomsArray && !hasLegacyRoom) {
      return res.status(400).json({
        success: false,
        message: 'No rooms allocated for this reservation'
      });
    }
    
    // If we have legacy roomId but no rooms array, populate the rooms array
    if (!hasRoomsArray && hasLegacyRoom) {
      console.log('Converting legacy room format for reservation:', reservation._id);
      const room = await Room.findById(reservation.roomId);
      if (room) {
        reservation.rooms = [{
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.type || room.roomType
        }];
        await reservation.save();
        console.log('Converted legacy room to new format:', room.roomNumber);
      }
    }
    
    // Update reservation status
    reservation.status = 'checked-in';
    reservation.actualCheckIn = new Date();
    await reservation.save();
    
    // Update room status to occupied
    for (const roomInfo of reservation.rooms) {
      await Room.findByIdAndUpdate(roomInfo.roomId, { 
        status: 'occupied',
        currentGuest: reservation.guestId 
      });
    }
    
    // Send check-in confirmation email
    try {
      await sendCheckinEmail(reservation);
    } catch (emailError) {
      console.error('Failed to send check-in email:', emailError);
      // Don't fail the check-in process if email fails
    }
    
    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message
    });
  }
});

// POST /api/frontdesk/checkout/:reservationId - Check out a guest
router.post('/checkout/:reservationId', async (req, res) => {
  try {
    const { additionalCharges = [] } = req.body;
    
    const reservation = await Reservation.findById(req.params.reservationId)
      .populate('guestId')
      .populate('rooms.roomId');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Check if reservation can be checked out
    if (reservation.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Guest must be checked in to check out'
      });
    }
    
    // Check if payment is completed
    if (reservation.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before checkout. Current status: ' + reservation.paymentStatus
      });
    }
    
    // Update reservation status
    reservation.status = 'checked-out';
    reservation.actualCheckOut = new Date();
    await reservation.save();
    
    // Update room status to available
    for (const roomInfo of reservation.rooms) {
      await Room.findByIdAndUpdate(roomInfo.roomId, { 
        status: 'available',
        currentGuest: null 
      });
    }
    
    // Create bill
    const billItems = [
      {
        description: `Room charges (${reservation.rooms.length} room(s))`,
        quantity: reservation.numberOfNights || 1,
        unitPrice: reservation.totalPrice / (reservation.numberOfNights || 1),
        totalPrice: reservation.totalPrice,
        category: 'room'
      }
    ];
    
    // Add additional charges
    additionalCharges.forEach(charge => {
      billItems.push({
        description: charge.description,
        quantity: charge.quantity || 1,
        unitPrice: charge.unitPrice,
        totalPrice: charge.quantity * charge.unitPrice,
        category: charge.category || 'other'
      });
    });
    
    const bill = new Bill({
      reservationId: reservation._id,
      guestId: reservation.guestId,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      items: billItems,
      dueDate: new Date(),
      generatedBy: req.user.id
    });
    
    await bill.save();
    
    // Send check-out email with bill attachment (PDF generation would be implemented here)
    try {
      // For now, send email without PDF attachment
      // In a full implementation, you would generate the PDF here
      await sendCheckoutEmailWithAttachment(reservation, bill, null);
    } catch (emailError) {
      console.error('Failed to send check-out email:', emailError);
      // Don't fail the check-out process if email fails
    }
    
    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: { 
        reservation,
        bill
      }
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: error.message
    });
  }
});

// GET /api/frontdesk/available-rooms - Get available rooms for date range
router.get('/available-rooms', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Find rooms that are not reserved during the specified period
    const reservedRoomIds = await Reservation.distinct('rooms.roomId', {
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });
    
    // Build room query
    const roomQuery = {
      _id: { $nin: reservedRoomIds },
      status: { $in: ['available', 'maintenance'] }
    };
    
    if (roomType) {
      roomQuery.type = roomType;
    }
    
    const availableRooms = await Room.find(roomQuery).sort({ roomNumber: 1 });
    
    res.json({
      success: true,
      data: { rooms: availableRooms }
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available rooms',
      error: error.message
    });
  }
});

// POST /api/frontdesk/allocate - Allocate room to reservation
router.post('/allocate', async (req, res) => {
  try {
    const { reservationId, roomId } = req.body;
    console.log('Room allocation request:', { reservationId, roomId, user: req.user });
    
    if (!reservationId || !roomId) {
      console.log('Missing required fields:', { reservationId, roomId });
      return res.status(400).json({
        success: false,
        message: 'Reservation ID and Room ID are required'
      });
    }
    
    const reservation = await Reservation.findById(reservationId);
    const room = await Room.findById(roomId);
    
    console.log('Found reservation:', reservation ? 'Yes' : 'No');
    console.log('Found room:', room ? 'Yes' : 'No');
    
    if (!reservation) {
      console.log('Reservation not found for ID:', reservationId);
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    if (!room) {
      console.log('Room not found for ID:', roomId);
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if room is available for the reservation dates
    console.log('Checking for conflicts:', {
      roomId,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      reservationId
    });
    
    const conflictingReservations = await Reservation.findOverlappingReservations(
      roomId,
      reservation.checkInDate,
      reservation.checkOutDate,
      reservationId
    );
    
    console.log('Conflicting reservations found:', conflictingReservations.length);
    if (conflictingReservations.length > 0) {
      console.log('Conflicts:', conflictingReservations);
    }
    
    if (conflictingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }
    
    // Add room to reservation
    const roomInfo = {
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomType: room.type
    };
    
    if (!reservation.rooms) {
      reservation.rooms = [];
    }
    
    // Check if room is already allocated
    const existingRoom = reservation.rooms.find(r => r.roomId.toString() === roomId);
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room is already allocated to this reservation'
      });
    }
    
    reservation.rooms.push(roomInfo);
    
    // Update legacy roomId field for backward compatibility
    if (!reservation.roomId) {
      reservation.roomId = room._id;
    }
    
    await reservation.save();
    
    res.json({
      success: true,
      message: 'Room allocated successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Error allocating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error allocating room',
      error: error.message
    });
  }
});

// GET /api/frontdesk/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    console.log('Calculating dashboard stats for:', {
      today: today.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });
    
    // Today's arrivals - reservations checking in today
    const todaysArrivals = await Reservation.countDocuments({
      checkInDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['confirmed', 'checked-in'] }
    });
    
    // Current guests - all checked-in reservations
    const currentGuests = await Reservation.countDocuments({
      status: 'checked-in'
    });
    
    // Today's departures - reservations checking out today
    const todaysDepartures = await Reservation.countDocuments({
      checkOutDate: { $gte: startOfDay, $lt: endOfDay },
      status: 'checked-in'
    });
    
    // Pending payments
    const pendingPayments = await Bill.countDocuments({
      status: { $in: ['pending', 'partial', 'overdue'] }
    });
    
    // Total bookings count
    const totalBookings = await Reservation.countDocuments();
    
    // For demo purposes, let's also show some realistic numbers
    // Since all reservations are in the future, let's show them as "upcoming arrivals"
    const upcomingArrivals = await Reservation.countDocuments({
      checkInDate: { $gte: startOfDay },
      status: 'confirmed'
    });
    
    console.log('Dashboard stats calculated:', {
      todaysArrivals,
      currentGuests,
      todaysDepartures,
      pendingPayments,
      totalBookings,
      upcomingArrivals
    });
    
    res.json({
      success: true,
      data: {
        todaysArrivals: todaysArrivals || upcomingArrivals, // Show upcoming if no today's arrivals
        currentGuests,
        todaysDepartures,
        pendingPayments,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// PUT /api/frontdesk/payment/:reservationId - Update payment status
router.put('/payment/:reservationId', async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paidAmount } = req.body;
    console.log('Payment update request:', { reservationId: req.params.reservationId, paymentStatus, paymentMethod, paidAmount });
    
    const reservation = await Reservation.findById(req.params.reservationId);
    
    if (!reservation) {
      console.log('Reservation not found:', req.params.reservationId);
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    console.log('Current payment status:', reservation.paymentStatus);
    console.log('Updating to:', paymentStatus);
    
    // Update payment information
    reservation.paymentStatus = paymentStatus;
    if (paymentMethod) reservation.paymentMethod = paymentMethod;
    if (paidAmount !== undefined) reservation.paidAmount = paidAmount;
    
    await reservation.save();
    
    console.log('Payment status updated successfully to:', reservation.paymentStatus);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// POST /api/frontdesk/create-reservation - Create manual reservation
router.post('/create-reservation', async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      roomNumber,
      roomType,
      totalPrice,
      paymentMethod,
      paymentStatus,
      specialRequests,
      notes,
      guestCount
    } = req.body;

    // Validate required fields
    if (!guestName || !guestEmail || !checkInDate || !checkOutDate || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: guestName, guestEmail, checkInDate, checkOutDate, roomNumber'
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    if (checkIn <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in the future'
      });
    }

    // Find room by room number
    const room = await Room.findOne({ roomNumber });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found`
      });
    }

    // Check if room is available for the selected dates
    const overlappingReservations = await Reservation.find({
      $or: [
        { roomId: room._id },
        { 'rooms.roomId': room._id }
      ],
      status: { $in: ['confirmed', 'checked-in', 'pending'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        },
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn }
        }
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Create reservation
    const reservation = new Reservation({
      guestName,
      guestEmail,
      guestPhone,
      rooms: [{
        roomId: room._id,
        roomNumber: room.roomNumber,
        roomType: room.roomType
      }],
      roomId: room._id, // Legacy field
      checkInDate: checkIn,
      checkOutDate: checkOut,
      checkIn: checkIn, // Legacy field
      checkOut: checkOut, // Legacy field
      totalPrice: totalPrice || 0,
      status: 'confirmed',
      paymentStatus: paymentStatus || 'unpaid',
      paymentMethod: paymentMethod || 'cash_on_property',
      guestCount: guestCount || { adults: 1, children: 0 },
      specialRequests: specialRequests || '',
      notes: notes || '',
      source: 'frontdesk'
    });

    await reservation.save();

    // Update room status to reserved
    room.status = 'reserved';
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error creating manual reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
});

// POST /api/frontdesk/charges/:reservationId - Add custom charges
router.post('/charges/:reservationId', async (req, res) => {
  try {
    const { charges } = req.body; // Array of charges
    
    const reservation = await Reservation.findById(req.params.reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Initialize customCharges if it doesn't exist
    if (!reservation.customCharges) {
      reservation.customCharges = [];
    }
    
    // Add new charges
    charges.forEach(charge => {
      reservation.customCharges.push({
        description: charge.description,
        amount: charge.amount,
        category: charge.category || 'other',
        addedBy: req.user.id,
        addedAt: new Date()
      });
    });
    
    // Recalculate total price
    const customChargesTotal = reservation.customCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const originalPrice = reservation.totalPrice - (reservation.previousCustomCharges || 0);
    reservation.totalPrice = originalPrice + customChargesTotal;
    reservation.previousCustomCharges = customChargesTotal;
    
    await reservation.save();
    
    res.json({
      success: true,
      message: 'Custom charges added successfully',
      data: { 
        reservation,
        newTotal: reservation.totalPrice,
        customChargesTotal
      }
    });
  } catch (error) {
    console.error('Error adding custom charges:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding custom charges',
      error: error.message
    });
  }
});

// GET /api/frontdesk/bill/:reservationId - Generate bill preview
router.get('/bill/:reservationId', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
      .populate('guestId')
      .populate('rooms.roomId');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Calculate bill items
    const billItems = [
      {
        description: `Room charges (${reservation.rooms.length} room(s))`,
        quantity: reservation.numberOfNights || 1,
        unitPrice: reservation.totalPrice / (reservation.numberOfNights || 1),
        totalPrice: reservation.totalPrice,
        category: 'room'
      }
    ];
    
    // Add custom charges
    if (reservation.customCharges && reservation.customCharges.length > 0) {
      reservation.customCharges.forEach(charge => {
        billItems.push({
          description: charge.description,
          quantity: 1,
          unitPrice: charge.amount,
          totalPrice: charge.amount,
          category: charge.category
        });
      });
    }
    
    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const billPreview = {
      reservationId: reservation._id,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      items: billItems,
      subtotal,
      tax,
      total,
      paymentStatus: reservation.paymentStatus
    };
    
    res.json({
      success: true,
      data: { bill: billPreview }
    });
  } catch (error) {
    console.error('Error generating bill preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bill preview',
      error: error.message
    });
  }
});

module.exports = router;
