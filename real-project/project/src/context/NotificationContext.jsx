import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Define the context type
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { api, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all notifications for the current user
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [api, isAuthenticated]);

  // Fetch all system notifications (announcements and system messages)
  const fetchAllSystemNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setSystemLoading(true);

    try {
      const response = await api.get('/notifications/system-all');
      setSystemNotifications(response.data);
    } catch (err) {
      console.error('Error fetching system notifications:', err);
      toast.error('Failed to fetch system notifications');
    } finally {
      setSystemLoading(false);
    }
  }, [api, isAuthenticated]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/unread');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [api, isAuthenticated]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, [api]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Update unread count
      setUnreadCount(0);

      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  }, [api]);

  // Delete a notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [api, notifications]);

  // Create a new notification (for managers and supervisors)
  const createNotification = useCallback(async (data) => {
    try {
      await api.post('/notifications', data);
      toast.success('Notification sent successfully');
      return true;
    } catch (err) {
      console.error('Error creating notification:', err);
      toast.error('Failed to send notification');
      return false;
    }
  }, [api]);

  // Create a system-wide notification
  const createSystemNotification = useCallback(async (data) => {
    try {
      const response = await api.post('/notifications/system', data);
      toast.success(`Notification sent to ${response.data.count} users`);

      // Refresh notifications after sending
      fetchNotifications();
      fetchUnreadCount();
      fetchAllSystemNotifications();

      return true;
    } catch (err) {
      console.error('Error creating system notification:', err);
      toast.error('Failed to send system notification');
      return false;
    }
  }, [api, fetchNotifications, fetchUnreadCount, fetchAllSystemNotifications]);

  // Create notifications for multiple users
  const createBulkNotifications = useCallback(async (data) => {
    try {
      const response = await api.post('/notifications/bulk', data);
      toast.success(`Notifications sent to ${response.data.count} users`);

      // Refresh notifications after sending
      fetchNotifications();
      fetchUnreadCount();
      fetchAllSystemNotifications();

      return true;
    } catch (err) {
      console.error('Error creating bulk notifications:', err);
      toast.error('Failed to send notifications');
      return false;
    }
  }, [api, fetchNotifications, fetchUnreadCount, fetchAllSystemNotifications]);

  // Toggle important status of a notification
  const toggleImportant = useCallback(async (id) => {
    try {
      // Find the notification to toggle
      const notification = notifications.find(n => n.id === id);
      if (!notification) return;

      const newImportantStatus = !notification.is_important;

      // In a real application, this would call an API endpoint
      // await api.put(`/notifications/${id}/important`, { is_important: newImportantStatus });

      // For now, we'll just update the local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, is_important: newImportantStatus }
            : notification
        )
      );

      toast.success(newImportantStatus
        ? "Notification marked as important"
        : "Notification removed from important"
      );

      return true;
    } catch (err) {
      console.error('Error toggling important status:', err);
      toast.error('Failed to update notification');
      return false;
    }
  }, [notifications]);

  // Load notifications and unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Set up polling for unread count (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Format date to relative time (today, yesterday, or actual date)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    // This will be implemented in the UI components
    return type;
  };

  const value = {
    notifications,
    systemNotifications,
    unreadCount,
    loading,
    systemLoading,
    error,
    fetchNotifications,
    fetchAllSystemNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    createSystemNotification,
    createBulkNotifications,
    toggleImportant,
    formatDate,
    getNotificationIcon
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
