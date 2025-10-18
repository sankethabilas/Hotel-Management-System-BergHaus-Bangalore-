const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Reservation Service
 * Contains all business logic for reservation management
 */
class ReservationService {
  
  /**
   * Create a new reservation
   * @param {Object} reservationData - Reservation data
   * @returns {Promise<Object>} Created reservation
   */
  async createReservation(reservationData) {
    const { roomId, guestId, checkIn, checkOut, guestCount, specialRequests } = reservationData;
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      throw new Error('Check-out date must be after check-in date');
    }
    
    if (checkInDate <= new Date()) {
      throw new Error('Check-in date must be in the future');
    }
    
    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    if (!room.canBeReserved()) {
      throw new Error('Room is not available for reservation');
    }
    
    // Check if guest exists
    const guest = await User.findById(guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    // Check for overlapping reservations
    const overlappingReservations = await Reservation.findOverlappingReservations(
      roomId, 
      checkInDate, 
      checkOutDate
    );
    
    if (overlappingReservations.length > 0) {
      throw new Error('Room is not available for the selected dates');
    }
    
    // Calculate total price
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = numberOfNights * room.pricePerNight;
    
    // Create reservation with proper room assignment
    const reservation = new Reservation({
      guestId,
      roomId, // Legacy field for backward compatibility
      rooms: [{
        roomId: room._id,
        roomNumber: room.roomNumber,
        roomType: room.type || room.roomType
      }],
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      // Legacy fields for backward compatibility
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      guestCount,
      specialRequests
    });
    
    // Save reservation and update room status
    const session = await Reservation.startSession();
    try {
      await session.withTransaction(async () => {
        await reservation.save({ session });
        await room.updateStatus('reserved');
      });
    } finally {
      await session.endSession();
    }
    
    // Populate references for response
    await reservation.populate([
      { path: 'guestId', select: 'firstName lastName email phone' },
      { path: 'roomId', select: 'roomNumber roomType pricePerNight amenities' }
    ]);
    
    return reservation;
  }
  
  /**
   * Get reservation by ID
   * @param {string} reservationId - Reservation ID
   * @returns {Promise<Object>} Reservation details
   */
  async getReservationById(reservationId) {
    const reservation = await Reservation.findById(reservationId)
      .populate('guestId', 'firstName lastName email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight amenities capacity');
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    return reservation;
  }
  
  /**
   * Get reservations by guest ID
   * @param {string} guestId - Guest ID
   * @returns {Promise<Array>} List of reservations
   */
  async getReservationsByGuest(guestId) {
    const reservations = await Reservation.find({ guestId })
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 });
    
    return reservations;
  }
  
  /**
   * Get all reservations with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated reservations data
   */
  async getAllReservations(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    
    if (filters.roomType) {
      query['rooms.roomType'] = filters.roomType;
    }
    
    if (filters.startDate && filters.endDate) {
      query.checkInDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.search) {
      query.$or = [
        { guestName: { $regex: filters.search, $options: 'i' } },
        { guestEmail: { $regex: filters.search, $options: 'i' } },
        { reservationId: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log('🔍 getAllReservations query:', query);
    console.log('📄 Pagination - page:', page, 'limit:', limit, 'skip:', skip);
    
    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('guestId', 'firstName lastName email phone')
        .populate('rooms.roomId', 'roomNumber roomType pricePerNight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Reservation.countDocuments(query)
    ]);
    
    const pages = Math.ceil(total / limit);
    
    console.log('📊 Found reservations:', reservations.length, 'total:', total, 'pages:', pages);
    
    return {
      reservations,
      total,
      page,
      pages
    };
  }
  
  /**
   * Cancel a reservation
   * @param {string} reservationId - Reservation ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated reservation
   */
  async cancelReservation(reservationId, reason) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    if (reservation.status === 'cancelled') {
      throw new Error('Reservation is already cancelled');
    }
    
    if (!reservation.canBeCancelled()) {
      throw new Error('Reservation cannot be cancelled less than 24 hours before check-in');
    }
    
    // Get room to update its status
    const room = await Room.findById(reservation.roomId);
    
    const session = await Reservation.startSession();
    try {
      await session.withTransaction(async () => {
        await reservation.cancel(reason);
        if (room) {
          await room.updateStatus('available');
        }
      });
    } finally {
      await session.endSession();
    }
    
    // Populate references for response
    await reservation.populate([
      { path: 'guestId', select: 'firstName lastName email phone' },
      { path: 'roomId', select: 'roomNumber roomType pricePerNight' }
    ]);
    
    return reservation;
  }
  
  /**
   * Update reservation status
   * @param {string} reservationId - Reservation ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated reservation
   */
  async updateReservationStatus(reservationId, status) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    const oldStatus = reservation.status;
    reservation.status = status;
    
    // Update room status based on reservation status
    const room = await Room.findById(reservation.roomId);
    if (room) {
      if (status === 'confirmed' && oldStatus === 'pending') {
        // Keep room as reserved when confirming
      } else if (status === 'cancelled') {
        await room.updateStatus('available');
      }
    }
    
    await reservation.save();
    
    // Populate references for response
    await reservation.populate([
      { path: 'guestId', select: 'firstName lastName email phone' },
      { path: 'roomId', select: 'roomNumber roomType pricePerNight' }
    ]);
    
    return reservation;
  }
  
  /**
   * Update payment status
   * @param {string} reservationId - Reservation ID
   * @param {string} paymentStatus - New payment status
   * @returns {Promise<Object>} Updated reservation
   */
  async updatePaymentStatus(reservationId, paymentStatus) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    reservation.paymentStatus = paymentStatus;
    await reservation.save();
    
    // Populate references for response
    await reservation.populate([
      { path: 'guestId', select: 'firstName lastName email phone' },
      { path: 'roomId', select: 'roomNumber roomType pricePerNight' }
    ]);
    
    return reservation;
  }
  
  /**
   * Check room availability for given dates
   * @param {Date} checkIn - Check-in date
   * @param {Date} checkOut - Check-out date
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Available rooms
   */
  async checkRoomAvailability(checkIn, checkOut, filters = {}) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      throw new Error('Check-out date must be after check-in date');
    }
    
    // Find rooms with overlapping reservations
    const overlappingReservations = await Reservation.find({
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    }).select('roomId');
    
    const unavailableRoomIds = overlappingReservations.map(r => r.roomId);
    
    // Build query for available rooms
    const query = {
      _id: { $nin: unavailableRoomIds },
      status: 'available'
    };
    
    if (filters.roomType) {
      query.roomType = filters.roomType;
    }
    
    if (filters.minCapacity) {
      query.capacity = { $gte: filters.minCapacity };
    }
    
    const availableRooms = await Room.find(query);
    
    return availableRooms;
  }
  
  /**
   * Get reservation statistics
   * @returns {Promise<Object>} Reservation statistics
   */
  async getReservationStats() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          pendingReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          paidReservations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get additional stats
    const upcomingCheckIns = await Reservation.countDocuments({
      status: 'confirmed',
      checkInDate: { $gte: now, $lte: sevenDaysFromNow }
    });

    const ongoingStays = await Reservation.countDocuments({
      status: 'checked-in'
    });

    const checkedOutGuests = await Reservation.countDocuments({
      status: 'checked-out',
      checkOutDate: { $gte: thirtyDaysAgo }
    });
    
    const baseStats = stats[0] || {
      totalReservations: 0,
      totalRevenue: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      cancelledReservations: 0,
      paidReservations: 0
    };

    return {
      ...baseStats,
      upcomingCheckIns,
      ongoingStays,
      checkedOutGuests
    };
  }

  /**
   * Get reservation analytics
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Analytics data
   */
  async getReservationAnalytics(options = {}) {
    const { period = 'month', startDate, endDate } = options;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let daysBack = 30; // Default to 30 days
      
      switch (period) {
        case 'week':
          daysBack = 7;
          break;
        case 'month':
          daysBack = 30;
          break;
        case 'quarter':
          daysBack = 90;
          break;
        case 'year':
          daysBack = 365;
          break;
      }
      
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
        }
      };
    }

    const analytics = await Reservation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : 
                     period === 'week' ? '%Y-%U' : 
                     period === 'month' ? '%Y-%m' : '%Y',
              date: '$createdAt'
            }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          cancellations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      bookings: analytics,
      period,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Update reservation
   * @param {string} reservationId - Reservation ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated reservation
   */
  async updateReservation(reservationId, updateData) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Check for overlapping reservations if dates or room are being changed
    if (updateData.checkInDate || updateData.checkOutDate || updateData.roomId) {
      const checkIn = updateData.checkInDate || reservation.checkInDate;
      const checkOut = updateData.checkOutDate || reservation.checkOutDate;
      const roomId = updateData.roomId || reservation.roomId;

      const overlapping = await Reservation.findOverlappingReservations(
        roomId, checkIn, checkOut, reservationId
      );

      if (overlapping.length > 0) {
        throw new Error('Room is not available for the selected dates');
      }
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      updateData,
      { new: true, runValidators: true }
    ).populate('guestId', 'fullName email phone')
     .populate('roomId', 'roomNumber roomType price');

    return updatedReservation;
  }

  /**
   * Delete reservation
   * @param {string} reservationId - Reservation ID
   * @returns {Promise<void>}
   */
  async deleteReservation(reservationId) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Only allow deletion of pending or cancelled reservations
    if (reservation.status === 'confirmed' || reservation.status === 'checked-in') {
      throw new Error('Cannot delete confirmed or active reservations');
    }

    await Reservation.findByIdAndDelete(reservationId);
  }
}

module.exports = new ReservationService();
