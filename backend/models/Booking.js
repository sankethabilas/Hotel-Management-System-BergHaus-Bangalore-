const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Room Information
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required']
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required']
  },

  // Guest Information
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest ID is required']
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    lowercase: true,
    trim: true
  },
  guestPhone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true
  },
  guestIdPassport: {
    type: String,
    required: [true, 'Guest ID/Passport is required'],
    trim: true
  },

  // Booking Dates
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },

  // Booking Details
  numberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [10, 'Maximum 10 guests allowed']
  },
  totalNights: {
    type: Number
  },
  arrivalTime: {
    type: String,
    trim: true
  },

  // Pricing
  roomPrice: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Room price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  customCharges: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    category: {
      type: String,
      enum: ['food', 'minibar', 'laundry', 'damage', 'late_checkout', 'other'],
      default: 'other'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash_on_property'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    trim: true
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending'
  },

  // Special Requests
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },

  // Cancellation
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  refundAmount: {
    type: Number,
    default: 0
  },

  // Timestamps
  bookingDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },

  // Additional Information
  bookingReference: {
    type: String,
    unique: true
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  },
  reminderEmailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guestId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Pre-save middleware to calculate total nights and generate booking reference
bookingSchema.pre('save', function(next) {
  // Calculate total nights
  if (this.checkInDate && this.checkOutDate) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Generate booking reference if not exists
  if (!this.bookingReference) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingReference = `HMS${timestamp}${random}`;
  }

  // Update last modified
  this.lastModified = new Date();

  next();
});

// Static method to find overlapping bookings
bookingSchema.statics.findOverlappingBookings = function(roomIds, checkInDate, checkOutDate, excludeBookingId = null) {
  const query = {
    roomId: { $in: roomIds },
    status: { $in: ['confirmed', 'checked_in'] }, // Only consider active bookings
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate }
      }
    ]
  };

  // Exclude specific booking (for updates)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query);
};

// Static method to find available rooms
bookingSchema.statics.findAvailableRooms = async function(roomIds, checkInDate, checkOutDate, excludeBookingId = null) {
  const overlappingBookings = await this.findOverlappingBookings(roomIds, checkInDate, checkOutDate, excludeBookingId);
  const bookedRoomIds = overlappingBookings.map(booking => booking.roomId.toString());
  
  return roomIds.filter(roomId => !bookedRoomIds.includes(roomId.toString()));
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  return hoursUntilCheckIn > 24 && this.status === 'confirmed';
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (!this.canBeCancelled()) {
    return 0;
  }

  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

  // Full refund if cancelled more than 48 hours before check-in
  if (hoursUntilCheckIn > 48) {
    return this.totalAmount;
  }

  // 50% refund if cancelled between 24-48 hours before check-in
  if (hoursUntilCheckIn > 24) {
    return this.totalAmount * 0.5;
  }

  return 0;
};

// Transform output
bookingSchema.methods.toJSON = function() {
  const bookingObject = this.toObject();
  delete bookingObject.__v;
  return bookingObject;
};

module.exports = mongoose.model('Booking', bookingSchema);
