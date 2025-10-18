// Notification service for creating notifications
const Notification = require('../models/notificationModel');

// Create a notification when feedback needs a response
async function createResponseNeededNotification(feedbackId, feedbackDetails) {
  try {
    const notification = await Notification.create({
      type: 'response_needed',
      title: 'Feedback Response Needed',
      message: `New feedback from ${feedbackDetails.guestName} requires a response`,
      category: 'feedback',
      relatedId: feedbackId,
      relatedModel: 'Feedback',
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

module.exports = {
  createResponseNeededNotification
};
