const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for guest bookings
    default: null
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true
  },
  guestPhone: {
    type: String,
    trim: true
  },
  rooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    roomType: {
      type: String,
      required: true
    }
  }],
  // Legacy field for backward compatibility
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  // Legacy fields for backward compatibility
  checkIn: {
    type: Date,
    required: false
  },
  checkOut: {
    type: Date,
    required: false
  },
  actualCheckIn: {
    type: Date,
    default: null
  },
  actualCheckOut: {
    type: Date,
    default: null
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
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
  },
  // Additional fields for frontdesk operations
  reservationId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'walk-in', 'agent'],
    default: 'website'
  },
  notes: {
    type: String,
    trim: true
  },
  customCharges: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ['minibar', 'laundry', 'room_service', 'late_checkout', 'damages', 'other'],
      default: 'other'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  previousCustomCharges: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'other'],
    default: null
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Generate reservation ID before saving
reservationSchema.pre('save', function(next) {
  if (!this.reservationId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.reservationId = `HMS${timestamp}${random}`;
  }
  
  // Sync legacy fields for backward compatibility
  if (this.checkInDate && !this.checkIn) {
    this.checkIn = this.checkInDate;
  }
  if (this.checkOutDate && !this.checkOut) {
    this.checkOut = this.checkOutDate;
  }
  
  next();
});

// Indexes for efficient queries
reservationSchema.index({ guestId: 1 });
reservationSchema.index({ roomId: 1 });
reservationSchema.index({ 'rooms.roomId': 1 });
reservationSchema.index({ checkIn: 1, checkOut: 1 });
reservationSchema.index({ checkInDate: 1, checkOutDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ paymentStatus: 1 });
reservationSchema.index({ reservationId: 1 });
reservationSchema.index({ guestEmail: 1 });

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
    $or: [
      // Check new rooms array format
      { 'rooms.roomId': roomId },
      // Check legacy roomId field for backward compatibility
      { roomId: roomId }
    ],
    status: { $in: ['pending', 'confirmed', 'checked-in'] },
    $and: [
      {
        $or: [
          // Check new date field names
          {
            checkInDate: { $lt: new Date(checkOut) },
            checkOutDate: { $gt: new Date(checkIn) }
          },
          // Check legacy date field names for backward compatibility
          {
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) }
          }
        ]
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Reservation', reservationSchema);
