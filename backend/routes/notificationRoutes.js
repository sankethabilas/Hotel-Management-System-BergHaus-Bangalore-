const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Notification routes
router.get('/', getAllNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
