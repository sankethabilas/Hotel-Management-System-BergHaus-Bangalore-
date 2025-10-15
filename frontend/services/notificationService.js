import api from './api';

const notificationService = {
  // Get all notifications with pagination
  async getNotifications(page = 1, limit = 5, unreadOnly = false) {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit, unreadOnly }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get unread count');
    }
  },

  // Mark notification as read/unread
  async markAsRead(notificationId, isRead = true) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`, {
        isRead
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification');
    }
  },

  // Mark all as read
  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  // Delete all read notifications
  async deleteAllRead() {
    try {
      const response = await api.delete('/notifications/read/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete read notifications');
    }
  },

  // Check for pending feedback (manually trigger)
  async checkPendingFeedback() {
    try {
      const response = await api.post('/notifications/check-pending-feedback');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check pending feedback');
    }
  }
};

export default notificationService;
