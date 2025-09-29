'use client';

import React, { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  type: 'attendance' | 'task' | 'leave' | 'payment' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface RecentActivityProps {
  staffId: string;
}

export default function RecentActivity({ staffId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock activity data - replace with actual API call
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'attendance',
        title: 'Checked in',
        description: 'Successfully marked attendance for today',
        timestamp: '2025-09-28T08:00:00Z',
        metadata: { location: 'Main Entrance' }
      },
      {
        id: '2',
        type: 'task',
        title: 'Task completed',
        description: 'Finished preparing breakfast menu items',
        timestamp: '2025-09-28T07:30:00Z',
        metadata: { taskId: 'T001', category: 'Kitchen' }
      },
      {
        id: '3',
        type: 'leave',
        title: 'Leave approved',
        description: 'Your casual leave request for Oct 5-6 has been approved',
        timestamp: '2025-09-27T16:45:00Z',
        metadata: { leaveType: 'casual', days: 2 }
      },
      {
        id: '4',
        type: 'payment',
        title: 'Salary credited',
        description: 'Monthly salary for September has been credited',
        timestamp: '2025-09-25T12:00:00Z',
        metadata: { amount: 75000, type: 'salary' }
      },
      {
        id: '5',
        type: 'announcement',
        title: 'New shift schedule',
        description: 'Updated shift schedule for October is now available',
        timestamp: '2025-09-24T14:20:00Z',
        metadata: { department: 'Kitchen' }
      },
      {
        id: '6',
        type: 'task',
        title: 'New task assigned',
        description: 'Prepare special menu for weekend event',
        timestamp: '2025-09-24T10:15:00Z',
        metadata: { taskId: 'T002', priority: 'high' }
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, [staffId]);

  const getActivityIcon = (type: string) => {
    const icons = {
      attendance: '🕐',
      task: '✅',
      leave: '🏖️',
      payment: '💰',
      announcement: '📢'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      attendance: 'bg-blue-50 border-blue-200',
      task: 'bg-green-50 border-green-200',
      leave: 'bg-purple-50 border-purple-200',
      payment: 'bg-yellow-50 border-yellow-200',
      announcement: 'bg-red-50 border-red-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📱</div>
          <p className="text-gray-500">No recent activity found.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Activity icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${getActivityColor(activity.type)} flex items-center justify-center`}>
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                
                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  
                  {/* Additional metadata */}
                  {activity.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.type === 'payment' && activity.metadata.amount && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                          ₹{activity.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.type === 'task' && activity.metadata.priority && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          activity.metadata.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.metadata.priority.toUpperCase()} PRIORITY
                        </span>
                      )}
                      {activity.type === 'leave' && activity.metadata.days && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                          {activity.metadata.days} days
                        </span>
                      )}
                      {activity.metadata.location && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          📍 {activity.metadata.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}