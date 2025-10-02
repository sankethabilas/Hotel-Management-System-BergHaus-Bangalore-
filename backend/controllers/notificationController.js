import { Notification } from '../models/notificationModel.js';
import { Feedback } from '../models/feedbackModel.js';
import { createResponseNeededNotification } from '../services/notificationService.js';

// Get all notifications with pagination
export async function getAllNotifications(req, res) {
  try {
    const { page = 1, limit = 5, unreadOnly = false } = req.query;
    
    const query = {};
    
    // Filter by userId when auth is implemented
    // For now, get all notifications (userId is null)
    if (req.user && req.user._id) {
      query.userId = req.user._id;
    } else {
      query.userId = null; // Global notifications
    }

    // Filter unread only if requested
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false })
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + notifications.length < total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

// Get unread count
export async function getUnreadCount(req, res) {
  try {
    const query = { isRead: false };
    
    if (req.user && req.user._id) {
      query.userId = req.user._id;
    } else {
      query.userId = null;
    }

    const count = await Notification.countDocuments(query);
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
}

// Mark notification as read/unread
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ message: 'isRead must be a boolean value' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
}

// Mark all as read
export async function markAllAsRead(req, res) {
  try {
    const query = { isRead: false };
    
    if (req.user && req.user._id) {
      query.userId = req.user._id;
    } else {
      query.userId = null;
    }

    const result = await Notification.updateMany(
      query,
      { isRead: true }
    );

    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
}

// Delete all read notifications
export async function deleteAllRead(req, res) {
  try {
    const query = { isRead: true };
    
    if (req.user && req.user._id) {
      query.userId = req.user._id;
    } else {
      query.userId = null;
    }

    const result = await Notification.deleteMany(query);

    res.json({ 
      message: 'All read notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ message: 'Error deleting read notifications', error: error.message });
  }
}

// Check for feedback that needs response (older than 3 hours without response)
export async function checkPendingFeedback(req, res) {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    // Find feedback older than 3 hours without response
    const pendingFeedback = await Feedback.find({
      createdAt: { $lt: threeHoursAgo },
      $or: [
        { managerResponse: { $exists: false } },
        { managerResponse: '' },
        { managerResponse: null }
      ]
    });

    const notificationsCreated = [];

    for (const feedback of pendingFeedback) {
      const notification = await createResponseNeededNotification(feedback);
      if (notification) {
        notificationsCreated.push(notification);
      }
    }

    res.json({
      message: `Checked ${pendingFeedback.length} pending feedback items`,
      notificationsCreated: notificationsCreated.length,
      notifications: notificationsCreated
    });
  } catch (error) {
    console.error('Error checking pending feedback:', error);
    res.status(500).json({ message: 'Error checking pending feedback', error: error.message });
  }
}
