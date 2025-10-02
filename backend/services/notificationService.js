import { Notification } from '../models/notificationModel.js';

/**
 * Helper service to create notifications for different events
 */

// Create notification for new guest registration
export async function createGuestRegisteredNotification(guestUser) {
  try {
    const notification = await Notification.create({
      type: 'guest_registered',
      title: 'New Guest Registered',
      message: `${guestUser.firstName} ${guestUser.lastName} (${guestUser.email}) has registered as a new guest.`,
      category: 'guest',
      relatedId: guestUser._id,
      relatedModel: 'User',
      userId: null // Will be populated when auth is implemented
    });
    
    console.log('✅ Guest registration notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating guest registration notification:', error);
    // Don't throw - notification creation shouldn't break the main flow
    return null;
  }
}

// Create notification for new feedback submission
export async function createFeedbackSubmittedNotification(feedback) {
  try {
    const notification = await Notification.create({
      type: 'feedback_submitted',
      title: 'New Feedback Received',
      message: `New feedback received from ${feedback.guestName} with a ${feedback.rating}-star rating.`,
      category: 'feedback',
      relatedId: feedback._id,
      relatedModel: 'Feedback',
      userId: null
    });
    
    console.log('✅ Feedback submission notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating feedback submission notification:', error);
    return null;
  }
}

// Create notification for low rating
export async function createLowRatingNotification(feedback) {
  try {
    const notification = await Notification.create({
      type: 'low_rating',
      title: 'Low Rating Alert',
      message: `${feedback.guestName} left a ${feedback.rating}-star rating. Immediate attention may be required.`,
      category: 'alert',
      relatedId: feedback._id,
      relatedModel: 'Feedback',
      userId: null
    });
    
    console.log('✅ Low rating notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating low rating notification:', error);
    return null;
  }
}

// Create notification for feedback needing response
export async function createResponseNeededNotification(feedback) {
  try {
    // Check if notification already exists for this feedback
    const existingNotification = await Notification.findOne({
      type: 'response_needed',
      relatedId: feedback._id
    });

    if (existingNotification) {
      console.log('⚠️ Response needed notification already exists for feedback:', feedback._id);
      return existingNotification;
    }

    const notification = await Notification.create({
      type: 'response_needed',
      title: 'Feedback Response Required',
      message: `Feedback from ${feedback.guestName} (submitted ${getTimeAgo(feedback.createdAt)}) requires a response.`,
      category: 'alert',
      relatedId: feedback._id,
      relatedModel: 'Feedback',
      userId: null
    });
    
    console.log('✅ Response needed notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating response needed notification:', error);
    return null;
  }
}

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'recently';
  }
}

// Bulk create notifications for multiple admins (for future use)
export async function createNotificationForAdmins(notificationData, adminUserIds = []) {
  try {
    if (adminUserIds.length === 0) {
      // Create single global notification (current behavior)
      return await Notification.create({
        ...notificationData,
        userId: null
      });
    }

    // Create notification for each admin (future use)
    const notifications = await Notification.insertMany(
      adminUserIds.map(userId => ({
        ...notificationData,
        userId
      }))
    );

    console.log(`✅ Created ${notifications.length} notifications for admins`);
    return notifications;
  } catch (error) {
    console.error('❌ Error creating admin notifications:', error);
    return null;
  }
}
