import React, { useState } from 'react';
import { BellIcon, CheckCircleIcon, ClockIcon, TagIcon, AlertCircleIcon, XIcon } from 'lucide-react';
const notifications = [{
  id: 1,
  title: 'Upcoming Stay Reminder',
  message: 'Robert Davis has an upcoming stay on October 15, 2023.',
  type: 'reminder',
  date: '2023-09-15',
  read: false,
  guest: 'Robert Davis'
}, {
  id: 2,
  title: 'Loyalty Points Expiry',
  message: 'Jennifer Adams has 2,500 points expiring in 30 days.',
  type: 'expiry',
  date: '2023-09-14',
  read: false,
  guest: 'Jennifer Adams'
}, {
  id: 3,
  title: 'New Offer Available',
  message: 'Winter Holiday offer is now available to assign to guests.',
  type: 'offer',
  date: '2023-09-13',
  read: true,
  guest: null
}, {
  id: 4,
  title: 'Feedback Received',
  message: 'New feedback received from Michael Brown with a 5-star rating.',
  type: 'feedback',
  date: '2023-09-12',
  read: false,
  guest: 'Michael Brown'
}, {
  id: 5,
  title: 'Loyalty Tier Change',
  message: 'Thomas Wilson has reached Gold tier status.',
  type: 'loyalty',
  date: '2023-09-10',
  read: true,
  guest: 'Thomas Wilson'
}, {
  id: 6,
  title: 'Feedback Response Required',
  message: 'Sarah Wilson left feedback 3 days ago that requires a response.',
  type: 'alert',
  date: '2023-09-09',
  read: false,
  guest: 'Sarah Wilson'
}];
const NotificationCenter = () => {
  const [filter, setFilter] = useState('all'); // all, unread, reminders, offers, alerts
  const [selectedNotification, setSelectedNotification] = useState(null);
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'reminders') return notification.type === 'reminder';
    if (filter === 'offers') return notification.type === 'offer';
    if (filter === 'alerts') return notification.type === 'alert';
    return true;
  });
  const getTypeIcon = type => {
    switch (type) {
      case 'reminder':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'expiry':
        return <AlertCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'offer':
        return <TagIcon className="h-5 w-5 text-green-500" />;
      case 'feedback':
        return <CheckCircleIcon className="h-5 w-5 text-purple-500" />;
      case 'loyalty':
        return <BellIcon className="h-5 w-5 text-yellow-500" />;
      case 'alert':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  const markAsRead = id => {
    // In a real application, this would update the notification status in the database
    console.log(`Marking notification ${id} as read`);
  };
  const deleteNotification = id => {
    // In a real application, this would delete the notification
    console.log(`Deleting notification ${id}`);
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Notification Center
        </h1>
        <div className="flex space-x-3">
          <button className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
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
            <button onClick={() => setFilter('reminders')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'reminders' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Stay Reminders
            </button>
            <button onClick={() => setFilter('offers')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'offers' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Offers
            </button>
            <button onClick={() => setFilter('alerts')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'alerts' ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Alerts
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? filteredNotifications.map(notification => <div key={notification.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''} ${selectedNotification?.id === notification.id ? 'bg-gray-50' : ''}`} onClick={() => setSelectedNotification(notification)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center">
                        <p className="text-xs text-gray-400">
                          {notification.date}
                        </p>
                        {notification.guest && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {notification.guest}
                          </span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && <button onClick={e => {
                e.stopPropagation();
                markAsRead(notification.id);
              }} className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                        <span className="sr-only">Mark as read</span>
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>}
                    <button onClick={e => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }} className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                      <span className="sr-only">Delete</span>
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>) : <div className="py-12 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no notifications matching your current filter.
              </p>
            </div>}
        </div>
      </div>
      {/* Notification Detail Panel (could be expanded in a real application) */}
      {selectedNotification && <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Details
            </h2>
            <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-500">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              {getTypeIcon(selectedNotification.type)}
            </div>
            <div className="ml-3">
              <p className="text-lg font-medium text-gray-900">
                {selectedNotification.title}
              </p>
              <p className="mt-1 text-gray-500">
                {selectedNotification.message}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {selectedNotification.date}
              </p>
            </div>
          </div>
          {selectedNotification.guest && <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">
                Related Guest
              </h3>
              <div className="mt-2 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedNotification.guest.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedNotification.guest}
                  </p>
                </div>
                <div className="ml-auto">
                  <button className="text-sm text-navy-blue hover:text-navy-blue-dark">
                    View Profile
                  </button>
                </div>
              </div>
            </div>}
          <div className="mt-6 flex justify-end space-x-3">
            {!selectedNotification.read && <button onClick={() => markAsRead(selectedNotification.id)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                Mark as Read
              </button>}
            {selectedNotification.type === 'reminder' && <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                Send Reminder
              </button>}
            {selectedNotification.type === 'feedback' && <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                View Feedback
              </button>}
            {selectedNotification.type === 'offer' && <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                View Offer
              </button>}
          </div>
        </div>}
    </div>;
};
export default NotificationCenter;
