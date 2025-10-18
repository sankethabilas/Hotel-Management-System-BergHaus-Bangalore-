const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Reward description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['room-upgrade', 'dining-voucher', 'discount-voucher'],
      required: [true, 'Reward category is required']
    },
    pointsCost: {
      type: Number,
      required: [true, 'Points cost is required'],
      min: [0, 'Points cost cannot be negative']
    },
    termsAndConditions: {
      type: String,
      trim: true,
      default: 'Standard terms and conditions apply.'
    },
    minTierRequired: {
      type: String,
      enum: ['Silver', 'Gold', 'Platinum', null],
      default: null // null means available to all tiers
    },
    stockAvailable: {
      type: Number,
      default: null, // null means unlimited
      min: [0, 'Stock cannot be negative']
    },
    maxRedemptionsPerGuest: {
      type: Number,
      default: null, // null means unlimited
      min: [1, 'Max redemptions must be at least 1']
    },
    validityDays: {
      type: Number,
      default: 90, // validity after redemption in days
      min: [1, 'Validity must be at least 1 day']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    collection: 'rewards'
  }
);

// Index for efficient queries
rewardSchema.index({ category: 1, status: 1 });
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ status: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
