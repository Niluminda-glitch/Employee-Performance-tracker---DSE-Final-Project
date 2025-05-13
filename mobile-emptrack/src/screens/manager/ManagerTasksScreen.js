import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Badge, Button, ActivityIndicator, FAB, Searchbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { taskAPI } from '../../api/api';

const ManagerTasksScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tasks.filter(
        task => 
          task.title?.toLowerCase().includes(query) || 
          task.description?.toLowerCase().includes(query) ||
          task.assignee_name?.toLowerCase().includes(query)
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskAPI.getAllTasks();
      setTasks(tasksData);
      setFilteredTasks(tasksData);
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

  // Handle add task
  const handleAddTask = () => {
    Alert.alert('Add Task', 'This feature will be implemented soon!');
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

  // Mock tasks data (replace with actual API data)
  const mockTasks = [
    {
      id: '1',
      title: 'Complete Project Proposal',
      description: 'Finalize the project proposal document for client review.',
      status: 'completed',
      assignee_id: '1',
      assignee_name: 'John Doe',
      due_date: '2023-05-15',
    },
    {
      id: '2',
      title: 'Design UI Mockups',
      description: 'Create UI mockups for the new mobile application.',
      status: 'in_progress',
      assignee_id: '2',
      assignee_name: 'Jane Smith',
      due_date: '2023-05-20',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review the code for the backend API implementation.',
      status: 'pending',
      assignee_id: '3',
      assignee_name: 'Bob Johnson',
      due_date: '2023-05-25',
    },
    {
      id: '4',
      title: 'Testing',
      description: 'Perform testing on the new features.',
      status: 'pending',
      assignee_id: '4',
      assignee_name: 'Alice Williams',
      due_date: '2023-05-30',
    },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : mockTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks found.</Text>
        ) : (
          mockTasks
            .filter(task => 
              searchQuery === '' || 
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.assignee_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <Title style={styles.taskTitle}>{task.title}</Title>
                    {renderStatusBadge(task.status)}
                  </View>
                  
                  <Paragraph style={styles.taskDescription}>
                    {task.description}
                  </Paragraph>
                  
                  <View style={styles.taskDetails}>
                    <View style={styles.taskDetailItem}>
                      <Text style={styles.taskDetailLabel}>Assignee:</Text>
                      <Text style={styles.taskDetailValue}>{task.assignee_name}</Text>
                    </View>
                    
                    <View style={styles.taskDetailItem}>
                      <Text style={styles.taskDetailLabel}>Due Date:</Text>
                      <Text style={styles.taskDetailValue}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskActions}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        // View task details
                      }}
                      style={styles.actionButton}
                    >
                      View
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => {
                        // Edit task
                      }}
                      style={styles.actionButton}
                    >
                      Edit
                    </Button>
                    
                    {task.status !== 'completed' && (
                      <Button
                        mode="outlined"
                        onPress={() => {
                          // Mark as completed
                        }}
                        style={[styles.actionButton, styles.completeButton]}
                      >
                        Complete
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddTask}
        color={theme.colors.primaryForeground}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    margin: theme.spacing.md,
    elevation: 0,
    backgroundColor: theme.colors.card,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
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
    marginBottom: theme.spacing.sm,
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
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  taskDetails: {
    marginBottom: theme.spacing.md,
  },
  taskDetailItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  taskDetailLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginRight: theme.spacing.xs,
    width: 80,
  },
  taskDetailValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  completeButton: {
    borderColor: theme.colors.success,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
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

export default ManagerTasksScreen;
