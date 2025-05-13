import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph, Badge, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { taskAPI } from '../../api/api';

const EmployeeTasksScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskAPI.getTasksByUser(user.id);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <Text style={styles.title}>My Tasks</Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks assigned yet.</Text>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <Title style={styles.taskTitle}>{task.title}</Title>
                {renderStatusBadge(task.status)}
              </View>
              <Paragraph style={styles.taskDescription}>
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
                  }}
                >
                  View Details
                </Button>
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
  taskCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
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
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDueDate: {
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

export default EmployeeTasksScreen;
