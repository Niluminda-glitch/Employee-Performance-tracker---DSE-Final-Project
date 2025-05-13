import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Avatar, Badge, Button, ActivityIndicator, ProgressBar, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { taskAPI, notificationAPI } from '../../api/api';

const EmployeeDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data from APIs
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks and notifications in parallel
      const [tasksData, notificationsData] = await Promise.all([
        taskAPI.getTasksByUser(user.id),
        notificationAPI.getNotifications()
      ]);

      setTasks(tasksData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Render task status badge
  const renderStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'completed':
        color = theme.colors.success;
        break;
      case 'in_progress':
        color = theme.colors.info;
        break;
      case 'pending':
        color = theme.colors.warning;
        break;
      default:
        color = theme.colors.muted;
    }

    return (
      <Badge
        style={[styles.statusBadge, { backgroundColor: color }]}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Calculate summary data
  const summaryData = {
    tasksCompleted: tasks.filter(task => task.status === 'completed').length,
    tasksInProgress: tasks.filter(task => task.status === 'in_progress').length,
    tasksPending: tasks.filter(task => task.status === 'pending').length,
    totalTasks: tasks.length,
    unreadNotifications: notifications.filter(notification => !notification.read).length,
    totalNotifications: notifications.length,
    upcomingDeadlines: tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3 && task.status !== 'completed';
    }).length,
  };

  // Get active task (first in-progress task, or first pending task if no in-progress)
  const activeTask = tasks.find(task => task.status === 'in_progress') ||
                    tasks.find(task => task.status === 'pending');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Employee'}</Text>
          <View style={styles.roleContainer}>
            <Chip
              mode="outlined"
              style={styles.roleChip}
              textStyle={styles.roleChipText}
            >
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Employee'}
            </Chip>
            <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          </View>
        </View>
        <Avatar.Text
          size={60}
          label={(user?.full_name || 'E').substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
      </View>

      {/* Summary Cards - Row 1 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tasks</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="clipboard-check"
                style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}
                color={theme.colors.primary}
              />
              <Text style={styles.cardValue}>{summaryData.totalTasks}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Total assigned tasks</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>In Progress</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="clock-outline"
                style={[styles.cardIcon, { backgroundColor: theme.colors.info + '20' }]}
                color={theme.colors.info}
              />
              <Text style={styles.cardValue}>{summaryData.tasksInProgress}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Tasks in progress</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Row 2 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Notifications</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="bell"
                style={[styles.cardIcon, { backgroundColor: theme.colors.info + '20' }]}
                color={theme.colors.info}
              />
              <Text style={styles.cardValue}>{summaryData.unreadNotifications}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Unread notifications</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Deadlines</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="calendar-clock"
                style={[styles.cardIcon, { backgroundColor: theme.colors.warning + '20' }]}
                color={theme.colors.warning}
              />
              <Text style={styles.cardValue}>{summaryData.upcomingDeadlines}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Upcoming deadlines</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Task Status Breakdown */}
      <View style={styles.statusBreakdownContainer}>
        <Text style={styles.statusBreakdownTitle}>Task Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusLabelContainer}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.statusLabel}>Completed</Text>
          </View>
          <Text style={styles.statusValue}>{summaryData.tasksCompleted}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusLabelContainer}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.info }]} />
            <Text style={styles.statusLabel}>In Progress</Text>
          </View>
          <Text style={styles.statusValue}>{summaryData.tasksInProgress}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusLabelContainer}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
            <Text style={styles.statusLabel}>Pending</Text>
          </View>
          <Text style={styles.statusValue}>{summaryData.tasksPending}</Text>
        </View>
      </View>

      {/* Active Task Assistant */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Task Assistant</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAllText}>See All Tasks</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : !activeTask ? (
          <Text style={styles.emptyText}>No active tasks at the moment.</Text>
        ) : (
          <Card style={styles.activeTaskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <Title style={styles.taskTitle}>{activeTask.title}</Title>
                {renderStatusBadge(activeTask.status)}
              </View>

              <Paragraph style={styles.taskDescription}>
                {activeTask.description}
              </Paragraph>

              {/* Task Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {activeTask.status === 'completed' ? '100%' :
                     activeTask.status === 'in_progress' ? '50%' : '0%'}
                  </Text>
                </View>
                <ProgressBar
                  progress={
                    activeTask.status === 'completed' ? 1 :
                    activeTask.status === 'in_progress' ? 0.5 : 0
                  }
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
              </View>

              {/* Quality Checkpoints */}
              <View style={styles.checkpointsContainer}>
                <Text style={styles.checkpointsTitle}>Quality Checkpoints:</Text>
                {activeTask.quality_checkpoints && activeTask.quality_checkpoints.map((checkpoint, index) => (
                  <View key={index} style={styles.checkpointItem}>
                    <Avatar.Icon
                      size={24}
                      icon={checkpoint.icon}
                      style={[
                        styles.checkpointIcon,
                        {
                          backgroundColor: checkpoint.icon === 'check-circle'
                            ? theme.colors.success + '20'
                            : theme.colors.warning + '20'
                        }
                      ]}
                      color={
                        checkpoint.icon === 'check-circle'
                          ? theme.colors.success
                          : theme.colors.warning
                      }
                    />
                    <Text style={styles.checkpointText}>{checkpoint.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.taskFooter}>
                <Text style={styles.taskDueDate}>
                  Due: {new Date(activeTask.due_date).toLocaleDateString()}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    navigation.navigate('ActiveTask', { taskId: activeTask.id });
                  }}
                  style={styles.viewDetailsButton}
                >
                  View Full Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Quick Access Buttons */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('LeaveRequest')}
        >
          <Avatar.Icon
            size={40}
            icon="calendar-clock"
            style={styles.quickAccessIcon}
            color={theme.colors.primary}
          />
          <Text style={styles.quickAccessText}>Leave & Overtime</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('FindMentor')}
        >
          <Avatar.Icon
            size={40}
            icon="account-supervisor"
            style={styles.quickAccessIcon}
            color={theme.colors.primary}
          />
          <Text style={styles.quickAccessText}>Find Mentor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Avatar.Icon
            size={40}
            icon="bell"
            style={styles.quickAccessIcon}
            color={theme.colors.primary}
          />
          <Text style={styles.quickAccessText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Tasks Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        ) : (
          tasks.slice(0, 2).map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <Title style={styles.taskTitle}>{task.title}</Title>
                  {renderStatusBadge(task.status)}
                </View>
                <Paragraph style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Paragraph>
                <View style={styles.taskFooter}>
                  <Text style={styles.taskDueDate}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => {
                      // Navigate to task details
                      // navigation.navigate('TaskDetails', { taskId: task.id });
                    }}
                  >
                    View Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
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
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.mutedForeground,
  },
  userName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  roleChip: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  roleChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
  },
  dateText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xs,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardIcon: {
    marginRight: theme.spacing.sm,
  },
  cardValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  cardSubtext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  statusBreakdownContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  statusBreakdownTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
  },
  statusLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  statusValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  seeAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  taskCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  activeTaskCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  taskTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    flex: 1,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  taskDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  progressPercentage: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.muted,
  },
  checkpointsContainer: {
    marginBottom: theme.spacing.md,
  },
  checkpointsTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  checkpointIcon: {
    marginRight: theme.spacing.sm,
  },
  checkpointText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  taskDueDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  viewDetailsButton: {
    borderRadius: theme.borderRadius.md,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quickAccessButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  quickAccessIcon: {
    backgroundColor: theme.colors.primary + '10',
    marginBottom: theme.spacing.xs,
  },
  quickAccessText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.foreground,
    textAlign: 'center',
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

export default EmployeeDashboardScreen;
