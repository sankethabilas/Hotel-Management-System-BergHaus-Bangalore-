'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationBannerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  className?: string;
}

export function NotificationBanner({ notifications, onRemove, className }: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2 max-w-sm", className)}>
      {visibleNotifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={getAlertVariant(notification.type)}
          className={cn(
            "animate-in slide-in-from-right-full duration-300",
            notification.type === 'success' && "border-green-200 bg-green-50 text-green-800",
            notification.type === 'error' && "border-red-200 bg-red-50 text-red-800",
            notification.type === 'warning' && "border-yellow-200 bg-yellow-50 text-yellow-800",
            notification.type === 'info' && "border-blue-200 bg-blue-50 text-blue-800"
          )}
        >
          <div className="flex items-start gap-2">
            {getIcon(notification.type)}
            <div className="flex-1">
              <AlertDescription className="font-medium">
                {notification.title}
              </AlertDescription>
              <AlertDescription className="text-sm mt-1">
                {notification.message}
              </AlertDescription>
              {notification.action && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-6 text-xs"
                  onClick={notification.action.onClick}
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => onRemove(notification.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}
