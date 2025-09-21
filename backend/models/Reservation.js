const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest ID is required']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Check-in date must be in the future'
    }
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled'],
      message: 'Status must be pending, confirmed, or cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['unpaid', 'paid'],
      message: 'Payment status must be unpaid or paid'
    },
    default: 'unpaid'
  },
  guestCount: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least 1 adult is required']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative']
    }
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
reservationSchema.index({ guestId: 1 });
reservationSchema.index({ roomId: 1 });
reservationSchema.index({ checkIn: 1, checkOut: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ paymentStatus: 1 });

// Virtual for number of nights
reservationSchema.virtual('numberOfNights').get(function() {
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total guests
reservationSchema.virtual('totalGuests').get(function() {
  return this.guestCount.adults + this.guestCount.children;
});

// Method to check if reservation is active
reservationSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'confirmed' && 
         this.checkIn <= now && 
         this.checkOut > now;
};

// Method to check if reservation can be cancelled
reservationSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilCheckIn = (this.checkIn - now) / (1000 * 60 * 60);
  return this.status === 'confirmed' && hoursUntilCheckIn > 24;
};

// Method to cancel reservation
reservationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Static method to find overlapping reservations
reservationSchema.statics.findOverlappingReservations = function(roomId, checkIn, checkOut, excludeId = null) {
  const query = {
    roomId: roomId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Reservation', reservationSchema);
