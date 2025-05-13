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
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Badge,
  Button,
  ActivityIndicator,
  Divider,
  Chip,
  IconButton,
  ProgressBar,
  Searchbar,
  Menu,
  List,
  FAB,
  Modal,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { taskAPI } from '../../api/api';

// Mock data for tasks
const mockTasks = [
  {
    id: '1',
    title: 'Implement Login Feature',
    description: 'Create a login screen with email and password authentication',
    status: 'completed',
    priority: 'high',
    assignee: {
      id: '1',
      full_name: 'John Doe',
      avatar_url: null,
    },
    due_date: '2023-06-10',
    created_at: '2023-05-20T10:30:00Z',
    completed_at: '2023-06-08T14:20:00Z',
  },
  {
    id: '2',
    title: 'Design Dashboard UI',
    description: 'Create wireframes and mockups for the main dashboard',
    status: 'in_progress',
    priority: 'medium',
    assignee: {
      id: '2',
      full_name: 'Jane Smith',
      avatar_url: null,
    },
    due_date: '2023-06-15',
    created_at: '2023-05-25T09:15:00Z',
  },
  {
    id: '3',
    title: 'Fix Navigation Bug',
    description: 'Resolve the issue with back navigation in the profile screen',
    status: 'pending',
    priority: 'high',
    assignee: {
      id: '3',
      full_name: 'Alice Williams',
      avatar_url: null,
    },
    due_date: '2023-06-20',
    created_at: '2023-05-30T11:45:00Z',
  },
  {
    id: '4',
    title: 'Implement API Integration',
    description: 'Connect the app to the backend API endpoints',
    status: 'pending',
    priority: 'high',
    assignee: {
      id: '1',
      full_name: 'John Doe',
      avatar_url: null,
    },
    due_date: '2023-06-25',
    created_at: '2023-06-01T08:30:00Z',
  },
];

// Mock data for team members
const mockTeamMembers = [
  {
    id: '1',
    full_name: 'John Doe',
    job_title: 'Software Developer',
    avatar_url: null,
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    job_title: 'UI/UX Designer',
    avatar_url: null,
  },
  {
    id: '3',
    full_name: 'Alice Williams',
    job_title: 'QA Engineer',
    avatar_url: null,
  },
];

const TaskManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskMenuVisible, setTaskMenuVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState(null);
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Fetch tasks and team members on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (activeFilter === 'pending') {
      result = result.filter(task => task.status === 'pending');
    } else if (activeFilter === 'in_progress') {
      result = result.filter(task => task.status === 'in_progress');
    } else if (activeFilter === 'completed') {
      result = result.filter(task => task.status === 'completed');
    } else if (activeFilter === 'high_priority') {
      result = result.filter(task => task.priority === 'high');
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee.full_name.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, activeFilter]);

  // Fetch tasks and team members (mock implementation)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, these would be API calls
      // For now, we'll use mock data
      setTimeout(() => {
        setTasks(mockTasks);
        setFilteredTasks(mockTasks);
        setTeamMembers(mockTeamMembers);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle search
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setFilterMenuVisible(false);
  };

  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setTaskMenuVisible(true);
  };

  // Create new task
  const createTask = () => {
    // Validate form
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }
    
    if (!newTaskAssignee) {
      Alert.alert('Error', 'Please select an assignee.');
      return;
    }
    
    // In a real app, this would be an API call
    // For now, we'll just add it to our local state
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'pending',
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      due_date: newTaskDueDate,
      created_at: new Date().toISOString(),
    };
    
    setTasks([newTask, ...tasks]);
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskAssignee(null);
    setNewTaskDueDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    
    setCreateModalVisible(false);
    
    Alert.alert('Success', 'Task created successfully.');
  };

  // Update task status
  const updateTaskStatus = (taskId, newStatus) => {
    // In a real app, this would be an API call
    // For now, we'll just update our local state
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setTaskMenuVisible(false);
    
    Alert.alert('Success', `Task status updated to ${newStatus}.`);
  };

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    let color;
    switch (priority) {
      case 'high':
        color = theme.colors.destructive;
        break;
      case 'medium':
        color = theme.colors.warning;
        break;
      case 'low':
        color = theme.colors.success;
        break;
      default:
        color = theme.colors.muted;
    }

    return (
      <Badge
        style={[styles.priorityBadge, { backgroundColor: color }]}
      >
        {priority}
      </Badge>
    );
  };

  // Render status badge
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

  // Render task card
  const renderTaskCard = (task) => (
    <Card key={task.id} style={styles.taskCard} onPress={() => handleTaskSelect(task)}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Title style={styles.taskTitle}>{task.title}</Title>
            {renderPriorityBadge(task.priority)}
          </View>
          {renderStatusBadge(task.status)}
        </View>
        
        <Paragraph style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </Paragraph>
        
        <Divider style={styles.divider} />
        
        <View style={styles.taskFooter}>
          <View style={styles.assigneeContainer}>
            <Avatar.Text
              size={24}
              label={(task.assignee.full_name || 'U').substring(0, 2).toUpperCase()}
              style={styles.assigneeAvatar}
            />
            <Text style={styles.assigneeName}>{task.assignee.full_name}</Text>
          </View>
          
          <Text style={styles.dueDate}>
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Management</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterMenuVisible(true)}
            color={theme.colors.primary}
          />
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={<View />}
            style={styles.filterMenu}
          >
            <Menu.Item
              title="All Tasks"
              onPress={() => handleFilterSelect('all')}
              leadingIcon="clipboard-list"
            />
            <Menu.Item
              title="Pending Tasks"
              onPress={() => handleFilterSelect('pending')}
              leadingIcon="clock-outline"
            />
            <Menu.Item
              title="In Progress"
              onPress={() => handleFilterSelect('in_progress')}
              leadingIcon="progress-clock"
            />
            <Menu.Item
              title="Completed"
              onPress={() => handleFilterSelect('completed')}
              leadingIcon="check-circle"
            />
            <Divider />
            <Menu.Item
              title="High Priority"
              onPress={() => handleFilterSelect('high_priority')}
              leadingIcon="alert-circle"
            />
          </Menu>
        </View>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search tasks"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <Chip
          selected={activeFilter === 'all'}
          onPress={() => handleFilterSelect('all')}
          style={styles.filterChip}
        >
          All Tasks
        </Chip>
        <Chip
          selected={activeFilter === 'pending'}
          onPress={() => handleFilterSelect('pending')}
          style={styles.filterChip}
        >
          Pending
        </Chip>
        <Chip
          selected={activeFilter === 'in_progress'}
          onPress={() => handleFilterSelect('in_progress')}
          style={styles.filterChip}
        >
          In Progress
        </Chip>
        <Chip
          selected={activeFilter === 'completed'}
          onPress={() => handleFilterSelect('completed')}
          style={styles.filterChip}
        >
          Completed
        </Chip>
        <Chip
          selected={activeFilter === 'high_priority'}
          onPress={() => handleFilterSelect('high_priority')}
          style={styles.filterChip}
        >
          High Priority
        </Chip>
      </ScrollView>
      
      {/* Tasks List */}
      <ScrollView
        style={styles.tasksContainer}
        contentContainerStyle={styles.tasksContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks found.</Text>
        ) : (
          filteredTasks.map(task => renderTaskCard(task))
        )}
      </ScrollView>
      
      {/* Create Task FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setCreateModalVisible(true)}
        color={theme.colors.background}
      />
      
      {/* Task Action Menu */}
      {selectedTask && (
        <Menu
          visible={taskMenuVisible}
          onDismiss={() => setTaskMenuVisible(false)}
          anchor={<View />}
          style={styles.taskMenu}
        >
          <Menu.Item
            title="View Details"
            onPress={() => {
              setTaskMenuVisible(false);
              // Navigate to task details
            }}
            leadingIcon="eye"
          />
          {selectedTask.status !== 'in_progress' && (
            <Menu.Item
              title="Mark as In Progress"
              onPress={() => updateTaskStatus(selectedTask.id, 'in_progress')}
              leadingIcon="progress-clock"
            />
          )}
          {selectedTask.status !== 'completed' && (
            <Menu.Item
              title="Mark as Completed"
              onPress={() => updateTaskStatus(selectedTask.id, 'completed')}
              leadingIcon="check-circle"
            />
          )}
          {selectedTask.status !== 'pending' && (
            <Menu.Item
              title="Mark as Pending"
              onPress={() => updateTaskStatus(selectedTask.id, 'pending')}
              leadingIcon="clock-outline"
            />
          )}
          <Divider />
          <Menu.Item
            title="Edit Task"
            onPress={() => {
              setTaskMenuVisible(false);
              // Navigate to edit task
            }}
            leadingIcon="pencil"
          />
          <Menu.Item
            title="Delete Task"
            onPress={() => {
              setTaskMenuVisible(false);
              // Show delete confirmation
              Alert.alert(
                'Delete Task',
                'Are you sure you want to delete this task?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Delete',
                    onPress: () => {
                      // In a real app, this would be an API call
                      // For now, we'll just update our local state
                      setTasks(tasks.filter(t => t.id !== selectedTask.id));
                      Alert.alert('Success', 'Task deleted successfully.');
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
            leadingIcon="delete"
          />
        </Menu>
      )}
      
      {/* Create Task Modal */}
      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Create New Task</Title>
            
            <TextInput
              label="Task Title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Description"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              <Chip
                selected={newTaskPriority === 'low'}
                onPress={() => setNewTaskPriority('low')}
                style={[styles.priorityChip, { backgroundColor: theme.colors.success + '20' }]}
                selectedColor={theme.colors.success}
              >
                Low
              </Chip>
              <Chip
                selected={newTaskPriority === 'medium'}
                onPress={() => setNewTaskPriority('medium')}
                style={[styles.priorityChip, { backgroundColor: theme.colors.warning + '20' }]}
                selectedColor={theme.colors.warning}
              >
                Medium
              </Chip>
              <Chip
                selected={newTaskPriority === 'high'}
                onPress={() => setNewTaskPriority('high')}
                style={[styles.priorityChip, { backgroundColor: theme.colors.destructive + '20' }]}
                selectedColor={theme.colors.destructive}
              >
                High
              </Chip>
            </View>
            
            <Text style={styles.inputLabel}>Assignee</Text>
            <View style={styles.assigneeList}>
              {teamMembers.map(member => (
                <Chip
                  key={member.id}
                  selected={newTaskAssignee && newTaskAssignee.id === member.id}
                  onPress={() => setNewTaskAssignee(member)}
                  style={styles.assigneeChip}
                  avatar={
                    <Avatar.Text
                      size={24}
                      label={(member.full_name || 'U').substring(0, 2).toUpperCase()}
                    />
                  }
                >
                  {member.full_name}
                </Chip>
              ))}
            </View>
            
            <TextInput
              label="Due Date"
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
              style={styles.input}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />
            
            <View style={styles.modalButtonsContainer}>
              <Button
                mode="outlined"
                onPress={() => setCreateModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={createTask}
                style={styles.modalButton}
              >
                Create Task
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  headerActions: {
    flexDirection: 'row',
  },
  filterMenu: {
    marginTop: 40,
  },
  searchBar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
  },
  tasksContainer: {
    flex: 1,
  },
  tasksContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
    paddingBottom: theme.spacing.xl * 3, // Extra space for FAB
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
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginRight: theme.spacing.sm,
    flex: 1,
  },
  priorityBadge: {
    borderRadius: theme.borderRadius.full,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  taskDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  assigneeName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.foreground,
  },
  dueDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  taskMenu: {
    marginTop: 40,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  inputLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  priorityChip: {
    marginRight: theme.spacing.sm,
  },
  assigneeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  assigneeChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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

export default TaskManagementScreen;
