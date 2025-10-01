const express = require('express');
const { body } = require('express-validator');
const {
  searchAvailableRooms,
  createBooking,
  getBookingByReference,
  getUserBookings,
  cancelBooking,
  updateArrivalTime,
  updateBookingStatus,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const searchValidation = [
  body('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('roomType')
    .optional()
    .isString()
    .withMessage('Room type must be a string'),
  body('guests')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10')
];

const bookingValidation = [
  body('roomId')
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  body('guestName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  body('guestEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Guest email must be a valid email address'),
  body('guestPhone')
    .matches(/^[+0][\d]{7,14}$/)
    .withMessage('Guest phone must be a valid phone number'),
  body('guestIdPassport')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Guest ID/Passport must be between 5 and 20 characters'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('numberOfGuests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10'),
  body('paymentMethod')
    .isIn(['card', 'cash', 'online', 'bank_transfer'])
    .withMessage('Payment method must be one of: card, cash, online, bank_transfer'),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

const statusValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'])
    .withMessage('Invalid booking status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
];

const arrivalTimeValidation = [
  body('arrivalTime')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Arrival time must be between 1 and 50 characters')
];

// Public routes
router.post('/search', searchValidation, searchAvailableRooms);
router.post('/', bookingValidation, createBooking);
router.get('/:reference', getBookingByReference);

// Protected routes
router.get('/user/bookings', protect, getUserBookings);
router.post('/:id/cancel', protect, cancelBooking);
router.put('/:id/arrival-time', protect, arrivalTimeValidation, updateArrivalTime);

// Admin/Staff routes
router.get('/', protect, getAllBookings);
router.put('/:id/status', protect, statusValidation, updateBookingStatus);

module.exports = router;
