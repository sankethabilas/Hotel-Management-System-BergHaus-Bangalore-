const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');
const {
  validateCreateReservation,
  validateUpdateReservationStatus,
  validateUpdatePaymentStatus,
  validateRoomAvailability,
  validateMongoId
} = require('../middleware/reservationValidation');

/**
 * Reservation Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(protect);

// Create a new reservation
router.post('/', validateCreateReservation, reservationController.createReservation);

// Get all reservations (admin only)
router.get('/', reservationController.getAllReservations);

// Get reservation statistics (admin only)
router.get('/stats', reservationController.getReservationStats);

// Get reservation analytics (admin only)
router.get('/analytics', reservationController.getReservationAnalytics);

// Check room availability (public endpoint, but requires authentication for consistency)
router.get('/rooms/availability', validateRoomAvailability, reservationController.checkRoomAvailability);

// Get reservations by guest
router.get('/guest/:guestId', ...validateMongoId('guestId'), reservationController.getReservationsByGuest);

// Get reservation by ID
router.get('/:id', ...validateMongoId('id'), reservationController.getReservationById);

// Cancel a reservation
router.put('/:id/cancel', ...validateMongoId('id'), reservationController.cancelReservation);

// Update reservation status (admin only)
router.put('/:id/status', ...validateMongoId('id'), validateUpdateReservationStatus, reservationController.updateReservationStatus);

// Update payment status (admin only)
router.put('/:id/payment', ...validateMongoId('id'), validateUpdatePaymentStatus, reservationController.updatePaymentStatus);

// Update reservation (admin only)
router.put('/:id', ...validateMongoId('id'), reservationController.updateReservation);

// Delete reservation (admin only)
router.delete('/:id', ...validateMongoId('id'), reservationController.deleteReservation);

module.exports = router;
