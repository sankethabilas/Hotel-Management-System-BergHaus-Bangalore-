const ActivityLog = require('../models/ActivityLog');

// Middleware to log user activities
const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip logging for certain actions or if no user
      if (!req.user || options.skipLogging) {
        return next();
      }

      // Extract details from request
      const details = {
        method: req.method,
        url: req.originalUrl,
        body: options.includeBody ? req.body : undefined,
        params: req.params,
        query: req.query,
        ...options.details
      };

      // Get IP address
      const ipAddress = req.ip || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        'unknown';

      // Get user agent
      const userAgent = req.get('User-Agent') || 'unknown';

      // Prepare activity log data
      const logData = {
        userId: req.user._id || req.user.id,
        action,
        details,
        ipAddress,
        userAgent,
        sessionId: req.sessionID,
        resourceId: options.resourceId || req.params.id,
        resourceType: options.resourceType,
        severity: options.severity || 'low',
        metadata: {
          timestamp: new Date().toISOString(),
          ...options.metadata
        }
      };

      // Log activity asynchronously (don't block the request)
      ActivityLog.logActivity(logData).catch(error => {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid breaking the request
      });

      next();
    } catch (error) {
      console.error('Activity logger error:', error);
      next(); // Continue even if logging fails
    }
  };
};

// Specific activity loggers for common actions
const logUserLogin = logActivity('login', {
  severity: 'medium',
  details: { loginMethod: 'email' }
});

const logUserLogout = logActivity('logout', {
  severity: 'low'
});

const logUserRegistration = logActivity('register', {
  severity: 'medium',
  includeBody: false, // Don't log password
  details: { registrationMethod: 'email' }
});

const logProfileUpdate = logActivity('profile_update', {
  severity: 'low',
  includeBody: false,
  resourceType: 'user'
});

const logPasswordChange = logActivity('password_change', {
  severity: 'high',
  includeBody: false,
  resourceType: 'user'
});

const logBookingCreate = logActivity('booking_create', {
  severity: 'medium',
  resourceType: 'booking'
});

const logBookingUpdate = logActivity('booking_update', {
  severity: 'medium',
  resourceType: 'booking'
});

const logBookingCancel = logActivity('booking_cancel', {
  severity: 'medium',
  resourceType: 'booking'
});

const logPaymentMade = logActivity('payment_made', {
  severity: 'high',
  resourceType: 'payment'
});

const logUserCreated = logActivity('user_created', {
  severity: 'high',
  resourceType: 'user'
});

const logUserUpdated = logActivity('user_updated', {
  severity: 'medium',
  resourceType: 'user'
});

const logUserDeactivated = logActivity('user_deactivated', {
  severity: 'high',
  resourceType: 'user'
});

const logUserReactivated = logActivity('user_reactivated', {
  severity: 'high',
  resourceType: 'user'
});

const logUserBanned = logActivity('user_banned', {
  severity: 'critical',
  resourceType: 'user'
});

const logUserUnbanned = logActivity('user_unbanned', {
  severity: 'critical',
  resourceType: 'user'
});

const logRoleChanged = logActivity('role_changed', {
  severity: 'high',
  resourceType: 'user'
});

const logPermissionChanged = logActivity('permission_changed', {
  severity: 'high',
  resourceType: 'user'
});

const logNotificationSent = logActivity('notification_sent', {
  severity: 'low',
  resourceType: 'system'
});

const logDataExported = logActivity('data_exported', {
  severity: 'medium',
  resourceType: 'system'
});

const logAdminAction = logActivity('admin_action', {
  severity: 'high',
  resourceType: 'system'
});

// Utility function to log custom activities
const logCustomActivity = (action, options = {}) => {
  return logActivity(action, options);
};

module.exports = {
  logActivity,
  logUserLogin,
  logUserLogout,
  logUserRegistration,
  logProfileUpdate,
  logPasswordChange,
  logBookingCreate,
  logBookingUpdate,
  logBookingCancel,
  logPaymentMade,
  logUserCreated,
  logUserUpdated,
  logUserDeactivated,
  logUserReactivated,
  logUserBanned,
  logUserUnbanned,
  logRoleChanged,
  logPermissionChanged,
  logNotificationSent,
  logDataExported,
  logAdminAction,
  logCustomActivity
};
