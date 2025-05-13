import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
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
  Menu,
  List,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for organization performance
const mockOrgPerformance = {
  task_completion_rate: 85,
  on_time_completion_rate: 82,
  average_response_time: 3.8, // hours
  organization_rating: 88,
  task_status: {
    completed: 245,
    in_progress: 78,
    pending: 42,
  },
  performance_trend: [
    { month: 'Jan', value: 80 },
    { month: 'Feb', value: 82 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 83 },
    { month: 'May', value: 87 },
    { month: 'Jun', value: 88 },
  ],
};

// Mock data for department performance
const mockDepartmentPerformance = [
  { 
    name: 'Engineering', 
    performance: 87, 
    task_completion_rate: 92,
    on_time_completion_rate: 88,
  },
  { 
    name: 'Design', 
    performance: 92, 
    task_completion_rate: 95,
    on_time_completion_rate: 90,
  },
  { 
    name: 'Marketing', 
    performance: 78, 
    task_completion_rate: 85,
    on_time_completion_rate: 80,
  },
  { 
    name: 'HR', 
    performance: 90, 
    task_completion_rate: 94,
    on_time_completion_rate: 92,
  },
];

// Mock data for top performers
const mockTopPerformers = [
  {
    id: '1',
    full_name: 'Jane Smith',
    job_title: 'UI/UX Designer',
    department: 'Design',
    performance: 98,
    avatar_url: null,
  },
  {
    id: '2',
    full_name: 'John Doe',
    job_title: 'Software Developer',
    department: 'Engineering',
    performance: 95,
    avatar_url: null,
  },
  {
    id: '3',
    full_name: 'Alice Williams',
    job_title: 'HR Specialist',
    department: 'HR',
    performance: 94,
    avatar_url: null,
  },
];

const PerformanceAnalyticsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orgPerformance, setOrgPerformance] = useState(null);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [timeRangeMenuVisible, setTimeRangeMenuVisible] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data (mock implementation)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, these would be API calls
      // For now, we'll use mock data
      setTimeout(() => {
        setOrgPerformance(mockOrgPerformance);
        setDepartmentPerformance(mockDepartmentPerformance);
        setTopPerformers(mockTopPerformers);
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

  // Handle time range selection
  const handleTimeRangeSelect = (range) => {
    setTimeRange(range);
    setTimeRangeMenuVisible(false);
  };

  // Get time range display text
  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'quarter':
        return 'This Quarter';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  // Render performance indicator
  const renderPerformanceIndicator = (value) => {
    let color;
    if (value >= 90) {
      color = theme.colors.success;
    } else if (value >= 70) {
      color = theme.colors.info;
    } else if (value >= 50) {
      color = theme.colors.warning;
    } else {
      color = theme.colors.destructive;
    }

    return (
      <View style={styles.performanceIndicatorContainer}>
        <View style={[styles.performanceIndicator, { backgroundColor: color }]}>
          <Text style={styles.performanceIndicatorText}>{value}%</Text>
        </View>
      </View>
    );
  };

  // Render task status bar
  const renderTaskStatusBar = () => {
    if (!orgPerformance) return null;
    
    const total = orgPerformance.task_status.completed + 
                 orgPerformance.task_status.in_progress + 
                 orgPerformance.task_status.pending;
    
    const completedWidth = (orgPerformance.task_status.completed / total) * 100;
    const inProgressWidth = (orgPerformance.task_status.in_progress / total) * 100;
    const pendingWidth = (orgPerformance.task_status.pending / total) * 100;
    
    return (
      <View style={styles.taskStatusBarContainer}>
        <View style={styles.taskStatusBar}>
          <View 
            style={[
              styles.taskStatusSegment, 
              styles.completedSegment,
              { width: `${completedWidth}%` }
            ]} 
          />
          <View 
            style={[
              styles.taskStatusSegment, 
              styles.inProgressSegment,
              { width: `${inProgressWidth}%` }
            ]} 
          />
          <View 
            style={[
              styles.taskStatusSegment, 
              styles.pendingSegment,
              { width: `${pendingWidth}%` }
            ]} 
          />
        </View>
        
        <View style={styles.taskStatusLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.completedSegment]} />
            <Text style={styles.legendText}>Completed ({orgPerformance.task_status.completed})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.inProgressSegment]} />
            <Text style={styles.legendText}>In Progress ({orgPerformance.task_status.in_progress})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.pendingSegment]} />
            <Text style={styles.legendText}>Pending ({orgPerformance.task_status.pending})</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Analytics</Text>
        <TouchableOpacity 
          style={styles.timeRangeSelector}
          onPress={() => setTimeRangeMenuVisible(true)}
        >
          <Text style={styles.timeRangeText}>{getTimeRangeText()}</Text>
          <IconButton
            icon="chevron-down"
            size={20}
            iconColor={theme.colors.primary}
            style={styles.timeRangeIcon}
          />
        </TouchableOpacity>
        <Menu
          visible={timeRangeMenuVisible}
          onDismiss={() => setTimeRangeMenuVisible(false)}
          anchor={<View />}
          style={styles.timeRangeMenu}
        >
          <Menu.Item
            title="This Week"
            onPress={() => handleTimeRangeSelect('week')}
          />
          <Menu.Item
            title="This Month"
            onPress={() => handleTimeRangeSelect('month')}
          />
          <Menu.Item
            title="This Quarter"
            onPress={() => handleTimeRangeSelect('quarter')}
          />
          <Menu.Item
            title="This Year"
            onPress={() => handleTimeRangeSelect('year')}
          />
        </Menu>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Organization Performance Overview */}
            <Card style={styles.overviewCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Organization Performance Overview</Title>
                
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{orgPerformance.task_completion_rate}%</Text>
                    <Text style={styles.metricLabel}>Task Completion</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{orgPerformance.on_time_completion_rate}%</Text>
                    <Text style={styles.metricLabel}>On-Time Rate</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{orgPerformance.organization_rating}%</Text>
                    <Text style={styles.metricLabel}>Org. Rating</Text>
                  </View>
                </View>
                
                <View style={styles.responseTimeContainer}>
                  <Text style={styles.responseTimeLabel}>Average Response Time:</Text>
                  <Text style={styles.responseTimeValue}>{orgPerformance.average_response_time} hours</Text>
                </View>
              </Card.Content>
            </Card>
            
            {/* Task Status Breakdown */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Task Status Breakdown</Title>
                {renderTaskStatusBar()}
              </Card.Content>
            </Card>
            
            {/* Department Performance */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Title style={styles.cardTitle}>Department Performance</Title>
                  <TouchableOpacity onPress={() => navigation.navigate('Departments')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                
                {departmentPerformance.map((department, index) => (
                  <View key={index} style={styles.departmentPerformanceContainer}>
                    <View style={styles.departmentHeader}>
                      <Text style={styles.departmentName}>{department.name}</Text>
                      {renderPerformanceIndicator(department.performance)}
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressLabelContainer}>
                        <Text style={styles.progressLabel}>Task Completion</Text>
                        <Text style={styles.progressPercentage}>{department.task_completion_rate}%</Text>
                      </View>
                      <ProgressBar 
                        progress={department.task_completion_rate / 100} 
                        color={theme.colors.primary}
                        style={styles.progressBar}
                      />
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressLabelContainer}>
                        <Text style={styles.progressLabel}>On-Time Rate</Text>
                        <Text style={styles.progressPercentage}>{department.on_time_completion_rate}%</Text>
                      </View>
                      <ProgressBar 
                        progress={department.on_time_completion_rate / 100} 
                        color={theme.colors.info}
                        style={styles.progressBar}
                      />
                    </View>
                    
                    {index < departmentPerformance.length - 1 && (
                      <Divider style={styles.departmentDivider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
            
            {/* Top Performers */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Top Performers</Title>
                
                {topPerformers.map((performer, index) => (
                  <View key={performer.id} style={styles.performerContainer}>
                    <View style={styles.performerHeader}>
                      <Avatar.Text
                        size={40}
                        label={(performer.full_name || 'U').substring(0, 2).toUpperCase()}
                        style={styles.performerAvatar}
                      />
                      <View style={styles.performerInfo}>
                        <Text style={styles.performerName}>{performer.full_name}</Text>
                        <Text style={styles.performerRole}>{performer.job_title} • {performer.department}</Text>
                      </View>
                      {renderPerformanceIndicator(performer.performance)}
                    </View>
                    
                    {index < topPerformers.length - 1 && (
                      <Divider style={styles.performerDivider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                icon="file-export"
                onPress={() => {
                  // In a real app, this would generate and export a report
                  // For now, we'll just show an alert
                  alert('Report generation feature coming soon!');
                }}
                style={styles.actionButton}
              >
                Export Report
              </Button>
              
              <Button
                mode="outlined"
                icon="chart-box"
                onPress={() => {
                  // Navigate to detailed analytics
                  // navigation.navigate('DetailedAnalytics');
                }}
                style={styles.actionButton}
              >
                Detailed Analytics
              </Button>
            </View>
          </>
        )}
      </ScrollView>
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
    flex: 1,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  timeRangeText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  timeRangeIcon: {
    margin: 0,
  },
  timeRangeMenu: {
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  overviewCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  metricLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  responseTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.muted + '20',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  responseTimeLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginRight: theme.spacing.xs,
  },
  responseTimeValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  taskStatusBarContainer: {
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  seeAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  departmentPerformanceContainer: {
    marginBottom: theme.spacing.md,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  departmentName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  progressContainer: {
    marginBottom: theme.spacing.sm,
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
  departmentDivider: {
    marginTop: theme.spacing.md,
  },
  performerContainer: {
    marginBottom: theme.spacing.md,
  },
  performerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  performerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  performerRole: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  performanceIndicatorContainer: {
    marginLeft: theme.spacing.sm,
  },
  performanceIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceIndicatorText: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
  },
  performerDivider: {
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
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
});

export default PerformanceAnalyticsScreen;
