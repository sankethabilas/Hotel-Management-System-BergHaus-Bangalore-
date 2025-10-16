const mongoose = require('mongoose');

const ruleExecutionSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AutomatedRule',
      required: true,
      index: true
    },
    ruleName: {
      type: String,
      required: true
    },
    guestId: {
      type: String,
      required: true,
      index: true
    },
    loyaltyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loyalty',
      required: true
    },
    trigger: {
      type: String,
      required: true
    },
    triggerData: {
      type: mongoose.Schema.Types.Mixed
    },
    action: {
      type: String,
      required: true
    },
    pointsAwarded: {
      type: Number,
      default: 0
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointTransaction'
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      required: true
    },
    failureReason: {
      type: String
    },
    executedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    collection: 'ruleexecutions'
  }
);

// Index for queries
ruleExecutionSchema.index({ ruleId: 1, executedAt: -1 });
ruleExecutionSchema.index({ guestId: 1, executedAt: -1 });
ruleExecutionSchema.index({ status: 1 });

module.exports = mongoose.model('RuleExecution', ruleExecutionSchema);
