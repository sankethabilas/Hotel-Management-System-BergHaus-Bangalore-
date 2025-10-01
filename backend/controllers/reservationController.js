const reservationService = require('../services/reservationService');
const { validationResult } = require('express-validator');

/**
 * Reservation Controller
 * Handles HTTP requests for reservation management
 */
class ReservationController {
  
  /**
   * Create a new reservation
   * POST /reservations
   */
  async createReservation(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const reservationData = {
        ...req.body,
        guestId: req.user.id // Get from authenticated user
      };
      
      const reservation = await reservationService.createReservation(reservationData);
      
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create reservation'
      });
    }
  }
  
  /**
   * Get reservation by ID
   * GET /reservations/:id
   */
  async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(id);
      
      // Check if user is authorized to view this reservation
      if (req.user.role !== 'admin' && reservation.guestId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Error getting reservation:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Reservation not found'
      });
    }
  }
  
  /**
   * Get reservations by guest
   * GET /reservations/guest/:guestId
   */
  async getReservationsByGuest(req, res) {
    try {
      const { guestId } = req.params;
      
      // Check if user is authorized to view these reservations
      if (req.user.role !== 'admin' && guestId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      const reservations = await reservationService.getReservationsByGuest(guestId);
      
      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error getting guest reservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservations'
      });
    }
  }
  
  /**
   * Get all reservations (admin only)
   * GET /reservations
   */
  async getAllReservations(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const filters = req.query;
      const reservations = await reservationService.getAllReservations(filters);
      
      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error getting all reservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservations'
      });
    }
  }
  
  /**
   * Cancel a reservation
   * PUT /reservations/:id/cancel
   */
  async cancelReservation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const reservation = await reservationService.getReservationById(id);
      
      // Check if user is authorized to cancel this reservation
      if (req.user.role !== 'admin' && reservation.guestId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      const cancelledReservation = await reservationService.cancelReservation(id, reason);
      
      res.json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: cancelledReservation
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel reservation'
      });
    }
  }
  
  /**
   * Update reservation status (admin only)
   * PUT /reservations/:id/status
   */
  async updateReservationStatus(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedReservation = await reservationService.updateReservationStatus(id, status);
      
      res.json({
        success: true,
        message: 'Reservation status updated successfully',
        data: updatedReservation
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update reservation status'
      });
    }
  }
  
  /**
   * Update payment status (admin only)
   * PUT /reservations/:id/payment
   */
  async updatePaymentStatus(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const { id } = req.params;
      const { paymentStatus } = req.body;
      
      const updatedReservation = await reservationService.updatePaymentStatus(id, paymentStatus);
      
      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: updatedReservation
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update payment status'
      });
    }
  }
  
  /**
   * Check room availability
   * GET /rooms/availability
   */
  async checkRoomAvailability(req, res) {
    try {
      const { checkIn, checkOut, roomType, minCapacity } = req.query;
      
      if (!checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates are required'
        });
      }
      
      const filters = {};
      if (roomType) filters.roomType = roomType;
      if (minCapacity) filters.minCapacity = parseInt(minCapacity);
      
      const availableRooms = await reservationService.checkRoomAvailability(
        checkIn, 
        checkOut, 
        filters
      );
      
      res.json({
        success: true,
        data: availableRooms
      });
    } catch (error) {
      console.error('Error checking room availability:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to check room availability'
      });
    }
  }
  
  /**
   * Get reservation statistics (admin only)
   * GET /reservations/stats
   */
  async getReservationStats(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const stats = await reservationService.getReservationStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting reservation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservation statistics'
      });
    }
  }
}

module.exports = new ReservationController();
