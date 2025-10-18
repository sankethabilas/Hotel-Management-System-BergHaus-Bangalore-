const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'profile_update',
      'password_change',
      'booking_create',
      'booking_update',
      'booking_cancel',
      'payment_made',
      'user_created',
      'user_updated',
      'user_deactivated',
      'user_reactivated',
      'user_banned',
      'user_unbanned',
      'role_changed',
      'permission_changed',
      'notification_sent',
      'data_exported',
      'admin_action'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  sessionId: {
    type: String
  },
  resourceId: {
    type: String // ID of the resource being acted upon (booking, user, etc.)
  },
  resourceType: {
    type: String,
    enum: ['user', 'booking', 'payment', 'room', 'staff', 'inventory', 'system']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ ipAddress: 1, createdAt: -1 });
activityLogSchema.index({ resourceId: 1, resourceType: 1 });
activityLogSchema.index({ createdAt: -1 });

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Static method to get user activity
activityLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 50,
    action,
    startDate,
    endDate,
    severity
  } = options;

  const query = { userId };
  
  if (action) query.action = action;
  if (severity) query.severity = severity;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email role'),
    this.countDocuments(query)
  ]);

  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Static method to get system activity summary
activityLogSchema.statics.getActivitySummary = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate = new Date(),
    groupBy = 'day'
  } = options;

  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  let groupStage;
  if (groupBy === 'day') {
    groupStage = {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      },
      count: { $sum: 1 },
      actions: { $addToSet: '$action' }
    };
  } else if (groupBy === 'action') {
    groupStage = {
      _id: '$action',
      count: { $sum: 1 },
      uniqueUsers: { $addToSet: '$userId' }
    };
  }

  return await this.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
