const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  staffEmail: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'annual', 'casual', 'emergency', 'maternity', 'paternity', 'unpaid', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  adminComments: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
leaveSchema.index({ staffId: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ department: 1, status: 1 });
leaveSchema.index({ leaveType: 1 });

// Virtual for leave duration in a readable format
leaveSchema.virtual('duration').get(function() {
  if (this.numberOfDays === 1) {
    return '1 day';
  }
  return `${this.numberOfDays} days`;
});

// Method to check if leave is active (approved and within date range)
leaveSchema.methods.isActive = function() {
  const today = new Date();
  return this.status === 'approved' && 
         this.startDate <= today && 
         this.endDate >= today;
};

// Static method to get pending leave requests count
leaveSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

// Static method to get leaves by date range
leaveSchema.statics.getLeavesByDateRange = function(startDate, endDate) {
  return this.find({
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  }).populate('staffId', 'fullName email department');
};

module.exports = mongoose.model('Leave', leaveSchema);
