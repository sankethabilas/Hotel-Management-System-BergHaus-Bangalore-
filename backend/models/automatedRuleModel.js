const mongoose = require('mongoose');

const automatedRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    trigger: {
      type: String,
      enum: ['booking_created', 'booking_completed', 'feedback_submitted', 'tier_upgraded'],
      required: true
    },
    conditions: {
      minBookingAmount: {
        type: Number,
        min: 0
      },
      minFeedbackRating: {
        type: Number,
        min: 1,
        max: 5
      },
      tierRestrictions: {
        type: [String],
        enum: ['Silver', 'Gold', 'Platinum']
      },
      dateRange: {
        startDate: Date,
        endDate: Date
      }
    },
    action: {
      type: {
        type: String,
        enum: ['award_points', 'multiply_points', 'tier_upgrade'],
        required: true
      },
      points: {
        type: Number,
        min: 0
      },
      multiplier: {
        type: Number,
        min: 1
      },
      targetTier: {
        type: String,
        enum: ['Silver', 'Gold', 'Platinum']
      },
      notificationMessage: {
        type: String,
        trim: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 1,
      min: 1
    },
    executionCount: {
      type: Number,
      default: 0
    },
    lastExecuted: {
      type: Date
    },
    maxExecutionsPerUser: {
      type: Number,
      min: 1
    },
    expiryDays: {
      type: Number,
      min: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    collection: 'automatedrules'
  }
);

// Index for active rules
automatedRuleSchema.index({ isActive: 1, trigger: 1 });
automatedRuleSchema.index({ priority: -1 });

module.exports = mongoose.model('AutomatedRule', automatedRuleSchema);
