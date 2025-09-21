const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: {
      values: ['Single', 'Double', 'Suite'],
      message: 'Room type must be Single, Double, or Suite'
    }
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'reserved', 'occupied'],
      message: 'Status must be available, reserved, or occupied'
    },
    default: 'available'
  },
  amenities: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ status: 1 });

// Virtual for room availability check
roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

// Method to check if room can be reserved
roomSchema.methods.canBeReserved = function() {
  return this.status === 'available';
};

// Method to update room status
roomSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);
