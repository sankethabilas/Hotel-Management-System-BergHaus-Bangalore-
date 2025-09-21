/**
 * Data Transfer Objects for Reservation Management
 * Used for request validation and response formatting
 */

// DTO for creating a new reservation
const createReservationDTO = {
  roomId: {
    type: 'string',
    required: true,
    description: 'MongoDB ObjectId of the room to reserve'
  },
  checkIn: {
    type: 'string',
    required: true,
    format: 'date',
    description: 'Check-in date (ISO 8601 format)'
  },
  checkOut: {
    type: 'string',
    required: true,
    format: 'date',
    description: 'Check-out date (ISO 8601 format)'
  },
  guestCount: {
    adults: {
      type: 'number',
      required: true,
      min: 1,
      description: 'Number of adult guests'
    },
    children: {
      type: 'number',
      default: 0,
      min: 0,
      description: 'Number of child guests'
    }
  },
  specialRequests: {
    type: 'string',
    maxLength: 500,
    description: 'Special requests or notes'
  }
};

// DTO for updating reservation status
const updateReservationStatusDTO = {
  status: {
    type: 'string',
    required: true,
    enum: ['pending', 'confirmed', 'cancelled'],
    description: 'New reservation status'
  },
  cancellationReason: {
    type: 'string',
    description: 'Reason for cancellation (required if status is cancelled)'
  }
};

// DTO for updating payment status
const updatePaymentStatusDTO = {
  paymentStatus: {
    type: 'string',
    required: true,
    enum: ['unpaid', 'paid'],
    description: 'Payment status'
  }
};

// DTO for room availability query
const roomAvailabilityDTO = {
  checkIn: {
    type: 'string',
    required: true,
    format: 'date',
    description: 'Check-in date for availability search'
  },
  checkOut: {
    type: 'string',
    required: true,
    format: 'date',
    description: 'Check-out date for availability search'
  },
  roomType: {
    type: 'string',
    enum: ['Single', 'Double', 'Suite'],
    description: 'Filter by room type (optional)'
  },
  minCapacity: {
    type: 'number',
    min: 1,
    description: 'Minimum room capacity (optional)'
  }
};

// DTO for creating a new room
const createRoomDTO = {
  roomNumber: {
    type: 'string',
    required: true,
    unique: true,
    description: 'Unique room number'
  },
  roomType: {
    type: 'string',
    required: true,
    enum: ['Single', 'Double', 'Suite'],
    description: 'Type of room'
  },
  pricePerNight: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Price per night in LKR'
  },
  capacity: {
    type: 'number',
    required: true,
    min: 1,
    description: 'Maximum number of guests'
  },
  amenities: {
    type: 'array',
    items: {
      type: 'string'
    },
    description: 'List of room amenities'
  },
  description: {
    type: 'string',
    description: 'Room description'
  },
  images: {
    type: 'array',
    items: {
      type: 'string'
    },
    description: 'List of room image URLs'
  }
};

// DTO for updating room information
const updateRoomDTO = {
  roomType: {
    type: 'string',
    enum: ['Single', 'Double', 'Suite'],
    description: 'Type of room'
  },
  pricePerNight: {
    type: 'number',
    min: 0,
    description: 'Price per night in LKR'
  },
  status: {
    type: 'string',
    enum: ['available', 'reserved', 'occupied'],
    description: 'Room status'
  },
  capacity: {
    type: 'number',
    min: 1,
    description: 'Maximum number of guests'
  },
  amenities: {
    type: 'array',
    items: {
      type: 'string'
    },
    description: 'List of room amenities'
  },
  description: {
    type: 'string',
    description: 'Room description'
  },
  images: {
    type: 'array',
    items: {
      type: 'string'
    },
    description: 'List of room image URLs'
  }
};

module.exports = {
  createReservationDTO,
  updateReservationStatusDTO,
  updatePaymentStatusDTO,
  roomAvailabilityDTO,
  createRoomDTO,
  updateRoomDTO
};
