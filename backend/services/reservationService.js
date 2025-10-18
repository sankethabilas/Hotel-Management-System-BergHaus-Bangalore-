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
    
    // Create reservation
    const reservation = new Reservation({
      guestId,
      roomId,
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
   * @returns {Promise<Array>} List of reservations
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
      query['roomId.roomType'] = filters.roomType;
    }
    
    const reservations = await Reservation.find(query)
      .populate('guestId', 'firstName lastName email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 });
    
    return reservations;
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
    
    return stats[0] || {
      totalReservations: 0,
      totalRevenue: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      cancelledReservations: 0,
      paidReservations: 0
    };
  }
}

module.exports = new ReservationService();
