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
  Badge,
  Button,
  ActivityIndicator,
  Divider,
  Chip,
  IconButton,
  ProgressBar
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { userAPI } from '../../api/api';

const SupervisorDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch team members from API (mock implementation)
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, you would fetch team members based on supervisor ID
      // For now, we'll just fetch all employees
      const employeesData = await userAPI.getUsersByRole('employee');
      setTeamMembers(employeesData.slice(0, 5)); // Just take first 5 for demo
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamMembers();
  };

  // Mock data for pending requests
  const pendingRequests = [
    { id: 1, type: 'leave', employee: 'John Doe', status: 'pending', date: '2023-05-15' },
    { id: 2, type: 'overtime', employee: 'Jane Smith', status: 'pending', date: '2023-05-16' },
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
          <Text style={styles.userName}>{user?.full_name || 'Supervisor'}</Text>
          <View style={styles.roleContainer}>
            <Chip
              mode="outlined"
              style={styles.roleChip}
              textStyle={styles.roleChipText}
            >
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Supervisor'}
            </Chip>
            <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          </View>
        </View>
        <Avatar.Text
          size={60}
          label={(user?.full_name || 'S').substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
      </View>

      {/* Summary Cards - Row 1 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Team</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="account-group"
                style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}
                color={theme.colors.primary}
              />
              <Text style={styles.cardValue}>{teamMembers.length}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Team members</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tasks</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="clipboard-check"
                style={[styles.cardIcon, { backgroundColor: theme.colors.info + '20' }]}
                color={theme.colors.info}
              />
              <Text style={styles.cardValue}>
                {teamMembers.reduce((sum, member) => sum + (member.tasks_in_progress || 0), 0)}
              </Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Tasks in progress</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Row 2 */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Requests</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="calendar-clock"
                style={[styles.cardIcon, { backgroundColor: theme.colors.warning + '20' }]}
                color={theme.colors.warning}
              />
              <Text style={styles.cardValue}>{pendingRequests.length}</Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Pending requests</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance</Title>
            <View style={styles.cardContentRow}>
              <Avatar.Icon
                size={40}
                icon="chart-line"
                style={[styles.cardIcon, { backgroundColor: theme.colors.success + '20' }]}
                color={theme.colors.success}
              />
              <Text style={styles.cardValue}>
                {Math.round(
                  teamMembers.reduce((sum, member) => sum + (member.performance || 0), 0) /
                  (teamMembers.length || 1)
                )}%
              </Text>
            </View>
            <Paragraph style={styles.cardSubtext}>Team average</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Team Members Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Team')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : teamMembers.length === 0 ? (
          <Text style={styles.emptyText}>No team members found.</Text>
        ) : (
          teamMembers.slice(0, 2).map((member, index) => (
            <Card key={index} style={styles.memberCard}>
              <Card.Content>
                <View style={styles.memberHeader}>
                  <Avatar.Text
                    size={50}
                    label={(member.full_name || 'U').substring(0, 2).toUpperCase()}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Title style={styles.memberName}>{member.full_name}</Title>
                    <Paragraph style={styles.memberRole}>{member.job_title || 'Employee'}</Paragraph>
                  </View>
                  <Badge
                    style={[
                      styles.statusBadge,
                      { backgroundColor: member.status === 'active' ? theme.colors.success : theme.colors.muted }
                    ]}
                  >
                    {member.status || 'active'}
                  </Badge>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.memberStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{member.tasks_completed || 0}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{member.tasks_in_progress || 0}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{member.performance || 0}%</Text>
                    <Text style={styles.statLabel}>Performance</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Task Completion</Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(
                        ((member.tasks_completed || 0) /
                        ((member.tasks_completed || 0) + (member.tasks_in_progress || 0) || 1)) * 100
                      )}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={
                      (member.tasks_completed || 0) /
                      ((member.tasks_completed || 0) + (member.tasks_in_progress || 0) || 1)
                    }
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                </View>

                <View style={styles.memberActions}>
                  <Button
                    mode="outlined"
                    icon="clipboard-list"
                    onPress={() => {
                      // Navigate to member tasks
                    }}
                    style={styles.memberActionButton}
                  >
                    View Tasks
                  </Button>

                  <Button
                    mode="outlined"
                    icon="account-details"
                    onPress={() => {
                      // Navigate to member details
                    }}
                    style={styles.memberActionButton}
                  >
                    View Profile
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* Pending Requests Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <TouchableOpacity>
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

                <Paragraph style={styles.requestEmployee}>
                  From: {request.employee_name || request.employee}
                </Paragraph>

                <Divider style={styles.divider} />

                <View style={styles.requestDetails}>
                  {request.type === 'leave' && request.start_date && request.end_date ? (
                    <Text style={styles.requestDetail}>
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </Text>
                  ) : request.date ? (
                    <Text style={styles.requestDetail}>
                      {new Date(request.date).toLocaleDateString()} {request.hours && `• ${request.hours} hours`}
                    </Text>
                  ) : null}

                  {request.reason && (
                    <Text style={styles.requestReason}>{request.reason}</Text>
                  )}
                </View>

                <View style={styles.requestActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // Reject request
                    }}
                    style={[styles.requestActionButton, styles.rejectButton]}
                    labelStyle={styles.rejectButtonLabel}
                  >
                    Reject
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Approve request
                    }}
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

      {/* Quick Access Buttons */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Avatar.Icon
            size={40}
            icon="clipboard-list"
            style={styles.quickAccessIcon}
            color={theme.colors.primary}
          />
          <Text style={styles.quickAccessText}>Manage Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Team')}
        >
          <Avatar.Icon
            size={40}
            icon="account-group"
            style={styles.quickAccessIcon}
            color={theme.colors.primary}
          />
          <Text style={styles.quickAccessText}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Performance')}
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
  memberCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  memberAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  memberRole: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
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
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  memberActionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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
  requestEmployee: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
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

export default SupervisorDashboardScreen;
