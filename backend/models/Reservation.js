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
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  status: {
    type: String,
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    default: 'unpaid'
  },
  guestCount: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required']
    },
    children: {
      type: Number,
      default: 0
    }
  },
  specialRequests: {
    type: String,
    trim: true
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
