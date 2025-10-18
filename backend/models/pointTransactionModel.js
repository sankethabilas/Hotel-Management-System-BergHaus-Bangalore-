const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    loyaltyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loyalty',
      required: true,
      index: true
    },
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earn', 'redeem', 'adjustment', 'bonus', 'expiry'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    referenceType: {
      type: String,
      enum: ['booking', 'feedback', 'offer', 'manual', 'other'],
      default: 'manual'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Expiry Management Fields
    expiryDate: {
      type: Date,
      index: true
    },
    isExpired: {
      type: Boolean,
      default: false
    },
    expiryNotificationSent: {
      type: Boolean,
      default: false
    },
    sourceTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointTransaction'
    }
  },
  { 
    timestamps: true,
    collection: 'pointtransactions'
  }
);

// Index for efficient queries
pointTransactionSchema.index({ guestId: 1, createdAt: -1 });
pointTransactionSchema.index({ loyaltyId: 1, createdAt: -1 });

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
