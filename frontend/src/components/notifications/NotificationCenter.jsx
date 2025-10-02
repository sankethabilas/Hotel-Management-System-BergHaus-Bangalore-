import React, { useState, useEffect } from 'react';
import { BellIcon, UserIcon, MessageSquareIcon, AlertCircleIcon, XIcon, Loader2 } from 'lucide-react';
import notificationService from '../../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, guest, feedback, alert
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    hasMore: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch notifications on mount and filter change
  useEffect(() => {
    fetchNotifications(1, true);
  }, [filter]);

  const fetchNotifications = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const unreadOnly = filter === 'unread';
      const response = await notificationService.getNotifications(page, pagination.limit, unreadOnly);
      
      // Filter by category if needed
      let filteredData = response.notifications;
      if (filter !== 'all' && filter !== 'unread') {
        filteredData = response.notifications.filter(n => n.category === filter);
      }

      if (reset) {
        setNotifications(filteredData);
      } else {
        setNotifications(prev => [...prev, ...filteredData]);
      }

      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.hasMore
      });

      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchNotifications(pagination.page + 1, false);
  };

  const handleMarkAsRead = async (notificationId, currentReadStatus) => {
    try {
      await notificationService.markAsRead(notificationId, !currentReadStatus);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: !currentReadStatus } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => currentReadStatus ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error marking notification:', err);
      alert('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Refresh notifications
      fetchNotifications(1, true);
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleCheckPendingFeedback = async () => {
    try {
      setLoading(true);
      await notificationService.checkPendingFeedback();
      
      // Refresh notifications
      fetchNotifications(1, true);
      alert('Checked for pending feedback responses');
    } catch (err) {
      console.error('Error checking pending feedback:', err);
      alert('Failed to check pending feedback');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'guest':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'feedback':
        return <MessageSquareIcon className="h-5 w-5 text-purple-500" />;
      case 'alert':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'guest':
        return 'bg-blue-100 text-blue-800';
      case 'feedback':
        return 'bg-purple-100 text-purple-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading notifications</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={() => fetchNotifications(1, true)}
          className="mt-2 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Center
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCheckPendingFeedback}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md text-sm"
          >
            Check Pending Feedback
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark All as Read
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              All
            </button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'unread' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Unread
            </button>
            <button onClick={() => setFilter('guest')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'guest' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Guests
            </button>
            <button onClick={() => setFilter('feedback')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'feedback' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Feedback
            </button>
            <button onClick={() => setFilter('alert')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'alert' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Alerts
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification._id} className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(notification.category)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                          </p>
                        </div>
                        <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(notification.category)}`}>
                          {notification.category}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                            className={`text-xs ${notification.isRead ? 'text-gray-500 hover:text-gray-700' : 'text-blue-600 hover:text-blue-800'} font-medium`}
                            title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notification.isRead ? 'Mark unread' : 'Mark read'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => handleDelete(notification._id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no notifications matching your current filter.
              </p>
            </div>
          )}
        </div>
        {/* Load More Button */}
        {pagination.hasMore && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                `Load More (${pagination.total - notifications.length} remaining)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
