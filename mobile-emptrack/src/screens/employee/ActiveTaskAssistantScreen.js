import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Badge,
  Button,
  ActivityIndicator,
  ProgressBar,
  Checkbox,
  Divider,
  List,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { taskAPI } from '../../api/api';

const ActiveTaskAssistantScreen = ({ route, navigation }) => {
  const { taskId } = route.params || {};
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [progress, setProgress] = useState(0);

  // Fetch task on component mount
  useEffect(() => {
    fetchTask();
  }, [taskId]);

  // Fetch task from API
  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      let taskData;
      if (taskId) {
        // Fetch specific task if ID is provided
        taskData = await taskAPI.getTaskById(taskId);
      } else {
        // Otherwise, get all tasks and find the first active one
        const tasksData = await taskAPI.getTasksByUser(user.id);
        taskData = tasksData.find(t => t.status === 'in_progress') ||
                  tasksData.find(t => t.status === 'pending');
      }

      if (!taskData) {
        setError('No active task found.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setTask(taskData);

      // Initialize checkpoints with completion status
      if (taskData.quality_checkpoints) {
        setCheckpoints(
          taskData.quality_checkpoints.map(checkpoint => ({
            ...checkpoint,
            completed: checkpoint.icon === 'check-circle',
          }))
        );

        // Calculate progress
        const completedCount = taskData.quality_checkpoints.filter(
          cp => cp.icon === 'check-circle'
        ).length;
        setProgress(
          taskData.quality_checkpoints.length > 0
            ? completedCount / taskData.quality_checkpoints.length
            : 0
        );
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTask();
  };

  // Toggle checkpoint completion
  const toggleCheckpoint = (index) => {
    const updatedCheckpoints = [...checkpoints];
    updatedCheckpoints[index].completed = !updatedCheckpoints[index].completed;
    updatedCheckpoints[index].icon = updatedCheckpoints[index].completed ? 'check-circle' : 'clock';
    setCheckpoints(updatedCheckpoints);

    // Update progress
    const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
    setProgress(completedCount / updatedCheckpoints.length);

    // In a real app, we would save this to the backend
    // For now, we'll just update the local state
  };

  // Mark task as complete
  const markTaskComplete = () => {
    // In a real app, we would call the API to update the task status
    // For now, we'll just update the local state
    if (task) {
      setTask({
        ...task,
        status: 'completed',
      });
      setProgress(1);

      // Update all checkpoints to completed
      const updatedCheckpoints = checkpoints.map(cp => ({
        ...cp,
        completed: true,
        icon: 'check-circle',
      }));
      setCheckpoints(updatedCheckpoints);
    }
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

  // Open SOP link
  const openSOPLink = () => {
    // In a real app, this would be a link to the SOP document
    Linking.openURL('https://example.com/sop');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchTask} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.emptyText}>No active task found.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Tasks')}
          style={styles.viewTasksButton}
        >
          View All Tasks
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />
      }
    >
      {/* Task Header */}
      <Card style={styles.taskCard}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <Title style={styles.taskTitle}>{task.title}</Title>
            {renderStatusBadge(task.status)}
          </View>

          <Paragraph style={styles.taskDescription}>
            {task.description}
          </Paragraph>

          <View style={styles.taskMetaContainer}>
            <View style={styles.taskMetaItem}>
              <Text style={styles.taskMetaLabel}>Due Date:</Text>
              <Text style={styles.taskMetaValue}>
                {new Date(task.due_date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.taskMetaItem}>
              <Text style={styles.taskMetaLabel}>Assigned By:</Text>
              <Text style={styles.taskMetaValue}>{task.assignee_name || 'System'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Progress Tracking */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Task Progress</Title>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Completion</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Quality Checkpoints */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quality Checkpoints</Title>

          {checkpoints.map((checkpoint, index) => (
            <View key={index} style={styles.checkpointItem}>
              <Checkbox
                status={checkpoint.completed ? 'checked' : 'unchecked'}
                onPress={() => toggleCheckpoint(index)}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.checkpointText,
                  checkpoint.completed && styles.checkpointTextCompleted
                ]}
              >
                {checkpoint.text}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Resources */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Resources</Title>

          <List.Item
            title="Standard Operating Procedure"
            description="View the SOP for this task"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={openSOPLink}
            style={styles.resourceItem}
          />

          <List.Item
            title="Request Assistance"
            description="Get help from your supervisor"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {/* Navigate to help screen */}}
            style={styles.resourceItem}
          />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Back to Dashboard
        </Button>

        <Button
          mode="contained"
          onPress={markTaskComplete}
          style={styles.actionButton}
          disabled={task.status === 'completed'}
        >
          {task.status === 'completed' ? 'Task Completed' : 'Mark as Complete'}
        </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.destructive,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  viewTasksButton: {
    marginTop: theme.spacing.md,
  },
  taskCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  taskTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    flex: 1,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  taskDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  taskMetaContainer: {
    marginTop: theme.spacing.sm,
  },
  taskMetaItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  taskMetaLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.mutedForeground,
    width: 100,
  },
  taskMetaValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
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
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkpointText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  checkpointTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.mutedForeground,
  },
  resourceItem: {
    paddingVertical: theme.spacing.xs,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default ActiveTaskAssistantScreen;
