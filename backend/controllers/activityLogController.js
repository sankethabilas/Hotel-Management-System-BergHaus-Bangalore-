const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @desc    Get user activity logs
// @route   GET /api/activity-logs/user/:userId
// @access  Private/Admin
const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 50,
      action,
      startDate,
      endDate,
      severity
    } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await ActivityLog.getUserActivity(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      action,
      startDate,
      endDate,
      severity
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/activity-logs
// @access  Private/Admin
const getAllActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      startDate,
      endDate,
      severity,
      resourceType
    } = req.query;

    const query = {};
    
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (severity) query.severity = severity;
    if (resourceType) query.resourceType = resourceType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'firstName lastName email role')
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalLogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get activity summary/analytics
// @route   GET /api/activity-logs/summary
// @access  Private/Admin
const getActivitySummary = async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date(),
      groupBy = 'day'
    } = req.query;

    const summary = await ActivityLog.getActivitySummary({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      groupBy
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Export activity logs to CSV
// @route   GET /api/activity-logs/export
// @access  Private/Admin
const exportActivityLogs = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      action,
      userId,
      severity
    } = req.query;

    const query = {};
    
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email role')
      .lean();

    // Convert to CSV format
    const csvHeader = 'Date,User,Action,IP Address,Severity,Details\n';
    const csvRows = logs.map(log => {
      const user = log.userId ? `${log.userId.firstName} ${log.userId.lastName} (${log.userId.email})` : 'Unknown';
      const details = JSON.stringify(log.details).replace(/,/g, ';');
      return `${log.createdAt.toISOString()},${user},${log.action},${log.ipAddress},${log.severity},"${details}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/activity-logs/stats
// @access  Private/Admin
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      uniqueUsers,
      actionStats,
      severityStats,
      recentActivity
    ] = await Promise.all([
      // Total logs
      ActivityLog.countDocuments(matchStage),
      
      // Unique users
      ActivityLog.distinct('userId', matchStage).then(users => users.length),
      
      // Action statistics
      ActivityLog.aggregate([
        { $match: matchStage },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Severity statistics
      ActivityLog.aggregate([
        { $match: matchStage },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Recent activity (last 24 hours)
      ActivityLog.countDocuments({
        ...matchStage,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        uniqueUsers,
        recentActivity,
        actionStats,
        severityStats
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getUserActivityLogs,
  getAllActivityLogs,
  getActivitySummary,
  exportActivityLogs,
  getActivityStats
};
