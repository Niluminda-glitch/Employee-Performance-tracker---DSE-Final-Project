import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph, Avatar, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { notificationAPI } from '../../api/api';

const EmployeeNotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const notificationsData = await notificationAPI.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return 'clipboard-check';
      case 'message':
        return 'message';
      case 'alert':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'bell';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'task':
        return theme.colors.primary;
      case 'message':
        return theme.colors.info;
      case 'alert':
        return theme.colors.warning;
      case 'info':
        return theme.colors.success;
      default:
        return theme.colors.muted;
    }
  };

  // Mock notifications data (replace with actual API data)
  const mockNotifications = [
    {
      id: 1,
      type: 'task',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Complete quarterly report"',
      sender: 'John Manager',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: false,
    },
    {
      id: 2,
      type: 'message',
      title: 'Message from Supervisor',
      message: 'Please review the latest project updates and provide feedback.',
      sender: 'Sarah Supervisor',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Deadline Approaching',
      message: 'The deadline for project X is tomorrow. Please ensure all deliverables are submitted.',
      sender: 'System',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      read: false,
    },
    {
      id: 4,
      type: 'info',
      title: 'Office Closure',
      message: 'The office will be closed on Friday for maintenance. Please work remotely.',
      sender: 'Admin',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      read: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <Text style={styles.title}>Notifications</Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : mockNotifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet.</Text>
      ) : (
        mockNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard
            ]}
          >
            <Card.Content>
              <View style={styles.notificationHeader}>
                <Avatar.Icon
                  size={40}
                  icon={getNotificationIcon(notification.type)}
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) + '20' }
                  ]}
                  color={getNotificationColor(notification.type)}
                />
                <View style={styles.notificationHeaderText}>
                  <Title style={styles.notificationTitle}>{notification.title}</Title>
                  <Text style={styles.notificationSender}>From: {notification.sender}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <Divider style={styles.divider} />
              
              <Paragraph style={styles.notificationMessage}>
                {notification.message}
              </Paragraph>
              
              <View style={styles.notificationFooter}>
                <Text style={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleString()}
                </Text>
                
                {!notification.read && (
                  <Button
                    mode="text"
                    compact
                    onPress={() => {
                      // Mark as read functionality
                      const updatedNotifications = mockNotifications.map(n => 
                        n.id === notification.id ? { ...n, read: true } : n
                      );
                      setNotifications(updatedNotifications);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.foreground,
  },
  notificationCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  notificationIcon: {
    marginRight: theme.spacing.md,
  },
  notificationHeaderText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  notificationSender: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  notificationMessage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.destructive,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
});

export default EmployeeNotificationsScreen;
