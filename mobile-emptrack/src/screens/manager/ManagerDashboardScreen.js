import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Button,
  ActivityIndicator,
  Divider,
  Chip,
  Badge,
  IconButton,
  ProgressBar
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { userAPI } from '../../api/api';

const ManagerDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeesData = await userAPI.getUsersByRole('employee');
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  // Mock data for department stats
  const departmentStats = [
    { department: "Engineering", headcount: 25, performanceScore: 87, openRequests: 5 },
    { department: "Marketing", headcount: 12, performanceScore: 82, openRequests: 3 },
    { department: "Customer Support", headcount: 18, performanceScore: 90, openRequests: 2 },
  ];

  // Mock data for task stats
  const taskStats = {
    completed: 45,
    in_progress: 23,
    pending: 12,
  };

  // Mock data for pending requests
  const pendingRequests = [
    {
      id: '1',
      type: 'leave',
      employee_name: 'John Doe',
      department: 'Engineering',
      start_date: '2023-06-10',
      end_date: '2023-06-15',
      reason: 'Annual vacation',
      created_at: '2023-05-20T10:30:00Z',
    },
    {
      id: '2',
      type: 'overtime',
      employee_name: 'Jane Smith',
      department: 'Design',
      date: '2023-06-05',
      hours: 3,
      reason: 'Project deadline',
      created_at: '2023-05-25T09:15:00Z',
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Manager'}</Text>
          <View style={styles.roleContainer}>
            <Chip
              mode="outlined"
              style={styles.roleChip}
              textStyle={styles.roleChipText}
            >
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Manager'}
            </Chip>
            <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          </View>
        </View>
        <Avatar.Text
          size={60}
          label={(user?.full_name || 'M').substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
      </View>

      {/* Summary Cards - Row 1 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Employees</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="account-group"
                style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}
                color={theme.colors.primary}
              />
              <Text style={styles.cardValue}>{employees.length}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Total employees</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Departments</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="office-building"
                style={[styles.cardIcon, { backgroundColor: theme.colors.info + '20' }]}
                color={theme.colors.info}
              />
              <Text style={styles.cardValue}>{departmentStats.length}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Active departments</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Row 2 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tasks</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="clipboard-check"
                style={[styles.cardIcon, { backgroundColor: theme.colors.warning + '20' }]}
                color={theme.colors.warning}
              />
              <Text style={styles.cardValue}>
                {/* Mock task count */}
                {80}
              </Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Total tasks</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Requests</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="calendar-clock"
                style={[styles.cardIcon, { backgroundColor: theme.colors.success + '20' }]}
                color={theme.colors.success}
              />
              <Text style={styles.cardValue}>
                {/* Mock pending requests count */}
                {12}
              </Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Pending requests</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Task Status Breakdown */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Task Status Breakdown</Title>

          <View style={styles.taskStatusContainer}>
            <View style={styles.taskStatusBar}>
              <View
                style={[
                  styles.taskStatusSegment,
                  styles.completedSegment,
                  { width: `${(taskStats.completed / (taskStats.completed + taskStats.in_progress + taskStats.pending)) * 100}%` }
                ]}
              />
              <View
                style={[
                  styles.taskStatusSegment,
                  styles.inProgressSegment,
                  { width: `${(taskStats.in_progress / (taskStats.completed + taskStats.in_progress + taskStats.pending)) * 100}%` }
                ]}
              />
              <View
                style={[
                  styles.taskStatusSegment,
                  styles.pendingSegment,
                  { width: `${(taskStats.pending / (taskStats.completed + taskStats.in_progress + taskStats.pending)) * 100}%` }
                ]}
              />
            </View>

            <View style={styles.taskStatusLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completedSegment]} />
                <Text style={styles.legendText}>Completed ({taskStats.completed})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.inProgressSegment]} />
                <Text style={styles.legendText}>In Progress ({taskStats.in_progress})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.pendingSegment]} />
                <Text style={styles.legendText}>Pending ({taskStats.pending})</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Department Analysis Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Department Analysis</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : departmentStats.length === 0 ? (
          <Text style={styles.emptyText}>No departments found.</Text>
        ) : (
          departmentStats.map((dept, index) => (
            <Card key={index} style={styles.departmentCard}>
              <Card.Content>
                <View style={styles.departmentHeader}>
                  <Title style={styles.departmentTitle}>{dept.department}</Title>
                  <Avatar.Icon
                    size={36}
                    icon="office-building"
                    style={[styles.departmentIcon, { backgroundColor: theme.colors.accent }]}
                    color={theme.colors.primary}
                  />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dept.headcount}</Text>
                    <Text style={styles.statLabel}>Employees</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dept.performanceScore}%</Text>
                    <Text style={styles.statLabel}>Performance</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dept.openRequests}</Text>
                    <Text style={styles.statLabel}>Requests</Text>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  style={styles.viewDetailsButton}
                  onPress={() => {
                    // Navigate to department details
                  }}
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* Pending Requests */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {pendingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending requests.</Text>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} style={styles.requestCard}>
              <Card.Content>
                <View style={styles.requestHeader}>
                  <View style={styles.requestTypeContainer}>
                    <IconButton
                      icon={request.type === 'leave' ? 'calendar' : 'clock'}
                      size={20}
                      iconColor={theme.colors.primary}
                      style={styles.requestTypeIcon}
                    />
                    <Title style={styles.requestTitle}>
                      {request.type === 'leave' ? 'Leave Request' : 'Overtime Request'}
                    </Title>
                  </View>
                  <Badge
                    style={[
                      styles.requestTypeBadge,
                      { backgroundColor: request.type === 'leave' ? theme.colors.info : theme.colors.warning }
                    ]}
                  >
                    {request.type}
                  </Badge>
                </View>

                <View style={styles.employeeContainer}>
                  <Text style={styles.employeeName}>{request.employee_name}</Text>
                  <Text style={styles.departmentName}>{request.department}</Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.requestDetails}>
                  {request.type === 'leave' ? (
                    <Text style={styles.requestDetail}>
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text style={styles.requestDetail}>
                      {new Date(request.date).toLocaleDateString()} • {request.hours} hours
                    </Text>
                  )}
                  <Text style={styles.requestReason}>{request.reason}</Text>
                </View>

                <View style={styles.requestActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {}}
                    style={[styles.requestActionButton, styles.rejectButton]}
                    labelStyle={styles.rejectButtonLabel}
                  >
                    Reject
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {}}
                    style={[styles.requestActionButton, styles.approveButton]}
                  >
                    Approve
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* Quick Actions Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickAccessContainer}>
          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Users')}
          >
            <Avatar.Icon
              size={40}
              icon="account-multiple"
              style={styles.quickAccessIcon}
              color={theme.colors.primary}
            />
            <Text style={styles.quickAccessText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Departments')}
          >
            <Avatar.Icon
              size={40}
              icon="office-building"
              style={styles.quickAccessIcon}
              color={theme.colors.primary}
            />
            <Text style={styles.quickAccessText}>Departments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Avatar.Icon
              size={40}
              icon="chart-bar"
              style={styles.quickAccessIcon}
              color={theme.colors.primary}
            />
            <Text style={styles.quickAccessText}>Analytics</Text>
          </TouchableOpacity>
        </View>
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
  dateText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
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
  sectionCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  taskStatusContainer: {
    marginTop: theme.spacing.sm,
  },
  taskStatusBar: {
    height: 20,
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  taskStatusSegment: {
    height: '100%',
  },
  completedSegment: {
    backgroundColor: theme.colors.success,
  },
  inProgressSegment: {
    backgroundColor: theme.colors.info,
  },
  pendingSegment: {
    backgroundColor: theme.colors.warning,
  },
  taskStatusLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
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
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  departmentCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  departmentTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  departmentIcon: {
    marginLeft: theme.spacing.sm,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  viewDetailsButton: {
    borderColor: theme.colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
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
  requestCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTypeIcon: {
    margin: 0,
    marginRight: theme.spacing.xs,
  },
  requestTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  requestTypeBadge: {
    borderRadius: theme.borderRadius.full,
  },
  employeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  employeeName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  departmentName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  requestDetails: {
    marginVertical: theme.spacing.sm,
  },
  requestDetail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  requestReason: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  requestActionButton: {
    marginLeft: theme.spacing.sm,
  },
  rejectButton: {
    borderColor: theme.colors.destructive,
  },
  rejectButtonLabel: {
    color: theme.colors.destructive,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
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
});

export default ManagerDashboardScreen;
