const { body, param, query } = require('express-validator');

/**
 * Validation middleware for reservation operations
 */

// Validation for creating a reservation
const validateCreateReservation = [
  body('roomId')
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  body('checkIn')
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date')
    .custom((value) => {
      const checkInDate = new Date(value);
      const now = new Date();
      if (checkInDate <= now) {
        throw new Error('Check-in date must be in the future');
      }
      return true;
    }),
  
  body('checkOut')
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const checkOutDate = new Date(value);
      const checkInDate = new Date(req.body.checkIn);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  body('guestCount.adults')
    .isInt({ min: 1 })
    .withMessage('Number of adults must be at least 1'),
  
  body('guestCount.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of children cannot be negative'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

// Validation for updating reservation status
const validateUpdateReservationStatus = [
  param('id')
    .isMongoId()
    .withMessage('Reservation ID must be a valid MongoDB ObjectId'),
  
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled'])
    .withMessage('Status must be pending, confirmed, or cancelled'),
  
  body('cancellationReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
];

// Validation for updating payment status
const validateUpdatePaymentStatus = [
  param('id')
    .isMongoId()
    .withMessage('Reservation ID must be a valid MongoDB ObjectId'),
  
  body('paymentStatus')
    .isIn(['unpaid', 'paid'])
    .withMessage('Payment status must be unpaid or paid')
];

// Validation for room availability query
const validateRoomAvailability = [
  query('checkIn')
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date'),
  
  query('checkOut')
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const checkOutDate = new Date(value);
      const checkInDate = new Date(req.query.checkIn);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  query('roomType')
    .optional()
    .isIn(['Single', 'Double', 'Suite'])
    .withMessage('Room type must be Single, Double, or Suite'),
  
  query('minCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum capacity must be at least 1')
];

// Validation for creating a room
const validateCreateRoom = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  
  body('roomType')
    .isIn(['Single', 'Double', 'Suite'])
    .withMessage('Room type must be Single, Double, or Suite'),
  
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Room capacity must be at least 1'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isString()
    .withMessage('Each amenity must be a string'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

// Validation for updating a room
const validateUpdateRoom = [
  param('id')
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  body('roomNumber')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  
  body('roomType')
    .optional()
    .isIn(['Single', 'Double', 'Suite'])
    .withMessage('Room type must be Single, Double, or Suite'),
  
  body('pricePerNight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['available', 'reserved', 'occupied'])
    .withMessage('Status must be available, reserved, or occupied'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Room capacity must be at least 1'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isString()
    .withMessage('Each amenity must be a string'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

// Validation for MongoDB ObjectId parameters
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`)
];

module.exports = {
  validateCreateReservation,
  validateUpdateReservationStatus,
  validateUpdatePaymentStatus,
  validateRoomAvailability,
  validateCreateRoom,
  validateUpdateRoom,
  validateMongoId
};
