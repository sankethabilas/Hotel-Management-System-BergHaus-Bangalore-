import express from 'express';
import {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  checkPendingFeedback
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications with pagination
router.get('/', getAllNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read/unread
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all read notifications
router.delete('/read/all', deleteAllRead);

// Check for pending feedback and create notifications
router.post('/check-pending-feedback', checkPendingFeedback);

export default router;
