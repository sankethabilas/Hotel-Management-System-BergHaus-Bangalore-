import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    roomType: {
      type: String,
      required: true
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    guestName: {
      type: String,
      required: true
    },
    guestEmail: {
      type: String,
      required: true
    },
    guestPhone: {
      type: String
    },
    guestIdPassport: {
      type: String
    },
    checkInDate: {
      type: Date,
      required: true,
      index: true
    },
    checkOutDate: {
      type: Date,
      required: true,
      index: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    totalNights: {
      type: Number,
      required: true
    },
    roomPrice: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'bank_transfer'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded', 'cancelled'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
      default: 'pending'
    },
    specialRequests: {
      type: String
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false
    },
    reminderEmailSent: {
      type: Boolean,
      default: false
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true
    }
  },
  { 
    timestamps: true,
    collection: 'bookings' // Use existing collection name
  }
);

// Index for guest booking queries
bookingSchema.index({ guestId: 1, checkInDate: -1 });
bookingSchema.index({ guestEmail: 1, checkInDate: -1 });
bookingSchema.index({ status: 1, checkInDate: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
