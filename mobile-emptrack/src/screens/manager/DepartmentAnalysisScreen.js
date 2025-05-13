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
  ProgressBar,
  Menu,
  List,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for departments
const mockDepartments = [
  { 
    id: '1', 
    name: 'Engineering', 
    headcount: 25, 
    performance: 87, 
    open_requests: 5,
    task_completion_rate: 92,
    on_time_completion_rate: 88,
    average_response_time: 3.5, // hours
    supervisors: 3,
    managers: 1,
  },
  { 
    id: '2', 
    name: 'Design', 
    headcount: 12, 
    performance: 92, 
    open_requests: 3,
    task_completion_rate: 95,
    on_time_completion_rate: 90,
    average_response_time: 2.8, // hours
    supervisors: 2,
    managers: 1,
  },
  { 
    id: '3', 
    name: 'Marketing', 
    headcount: 18, 
    performance: 78, 
    open_requests: 7,
    task_completion_rate: 85,
    on_time_completion_rate: 80,
    average_response_time: 4.2, // hours
    supervisors: 2,
    managers: 1,
  },
  { 
    id: '4', 
    name: 'HR', 
    headcount: 8, 
    performance: 90, 
    open_requests: 2,
    task_completion_rate: 94,
    on_time_completion_rate: 92,
    average_response_time: 2.5, // hours
    supervisors: 1,
    managers: 1,
  },
];

// Mock data for resource allocation
const mockResourceAllocation = {
  total_employees: 63,
  departments: [
    { name: 'Engineering', count: 25, percentage: 39.7 },
    { name: 'Design', count: 12, percentage: 19.0 },
    { name: 'Marketing', count: 18, percentage: 28.6 },
    { name: 'HR', count: 8, percentage: 12.7 },
  ],
  roles: [
    { name: 'Employee', count: 55, percentage: 87.3 },
    { name: 'Supervisor', count: 4, percentage: 6.3 },
    { name: 'Manager', count: 4, percentage: 6.3 },
  ],
};

const DepartmentAnalysisScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [resourceAllocation, setResourceAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [timeRangeMenuVisible, setTimeRangeMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Sort departments based on selected criteria
  useEffect(() => {
    if (departments.length === 0) return;
    
    const sortedDepartments = [...departments].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'headcount':
          return b.headcount - a.headcount;
        case 'performance':
          return b.performance - a.performance;
        case 'requests':
          return b.open_requests - a.open_requests;
        case 'completion':
          return b.task_completion_rate - a.task_completion_rate;
        default:
          return 0;
      }
    });
    
    setDepartments(sortedDepartments);
  }, [sortBy]);

  // Fetch data (mock implementation)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, these would be API calls
      // For now, we'll use mock data
      setTimeout(() => {
        setDepartments(mockDepartments);
        setResourceAllocation(mockResourceAllocation);
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

  // Handle sort selection
  const handleSortSelect = (sort) => {
    setSortBy(sort);
    setSortMenuVisible(false);
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

  // Render department allocation bar
  const renderDepartmentAllocationBar = () => {
    if (!resourceAllocation) return null;
    
    return (
      <View style={styles.allocationBarContainer}>
        <View style={styles.allocationBar}>
          {resourceAllocation.departments.map((dept, index) => (
            <View 
              key={index}
              style={[
                styles.allocationSegment, 
                { 
                  width: `${dept.percentage}%`,
                  backgroundColor: 
                    index === 0 ? theme.colors.primary : 
                    index === 1 ? theme.colors.info : 
                    index === 2 ? theme.colors.warning : 
                    theme.colors.success
                }
              ]} 
            />
          ))}
        </View>
        
        <View style={styles.allocationLegend}>
          {resourceAllocation.departments.map((dept, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendDot, 
                  { 
                    backgroundColor: 
                      index === 0 ? theme.colors.primary : 
                      index === 1 ? theme.colors.info : 
                      index === 2 ? theme.colors.warning : 
                      theme.colors.success
                  }
                ]} 
              />
              <Text style={styles.legendText}>{dept.name} ({dept.count})</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Department Analysis</Text>
        <View style={styles.headerActions}>
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
          <IconButton
            icon="sort"
            size={24}
            onPress={() => setSortMenuVisible(true)}
            color={theme.colors.primary}
          />
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
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={<View />}
            style={styles.sortMenu}
          >
            <Menu.Item
              title="Sort by Name"
              onPress={() => handleSortSelect('name')}
            />
            <Menu.Item
              title="Sort by Headcount"
              onPress={() => handleSortSelect('headcount')}
            />
            <Menu.Item
              title="Sort by Performance"
              onPress={() => handleSortSelect('performance')}
            />
            <Menu.Item
              title="Sort by Open Requests"
              onPress={() => handleSortSelect('requests')}
            />
            <Menu.Item
              title="Sort by Completion Rate"
              onPress={() => handleSortSelect('completion')}
            />
          </Menu>
        </View>
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
            {/* Resource Allocation */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Resource Allocation</Title>
                <Paragraph style={styles.cardSubtitle}>
                  Total Employees: {resourceAllocation?.total_employees || 0}
                </Paragraph>
                
                {renderDepartmentAllocationBar()}
                
                <View style={styles.roleDistribution}>
                  <Text style={styles.roleDistributionTitle}>Role Distribution</Text>
                  {resourceAllocation?.roles.map((role, index) => (
                    <View key={index} style={styles.roleItem}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      <View style={styles.roleBarContainer}>
                        <View 
                          style={[
                            styles.roleBar, 
                            { width: `${role.percentage}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.roleCount}>{role.count}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
            
            {/* Department Performance */}
            <Title style={styles.sectionTitle}>Department Performance</Title>
            
            {departments.map((department) => (
              <Card key={department.id} style={styles.departmentCard}>
                <Card.Content>
                  <View style={styles.departmentHeader}>
                    <View style={styles.departmentInfo}>
                      <Title style={styles.departmentName}>{department.name}</Title>
                      <Paragraph style={styles.departmentHeadcount}>
                        {department.headcount} Employees • {department.supervisors} Supervisors • {department.managers} Manager
                      </Paragraph>
                    </View>
                    {renderPerformanceIndicator(department.performance)}
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.metricsContainer}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricValue}>{department.task_completion_rate}%</Text>
                      <Text style={styles.metricLabel}>Task Completion</Text>
                    </View>
                    
                    <View style={styles.metricItem}>
                      <Text style={styles.metricValue}>{department.on_time_completion_rate}%</Text>
                      <Text style={styles.metricLabel}>On-Time Rate</Text>
                    </View>
                    
                    <View style={styles.metricItem}>
                      <Text style={styles.metricValue}>{department.open_requests}</Text>
                      <Text style={styles.metricLabel}>Open Requests</Text>
                    </View>
                  </View>
                  
                  <View style={styles.responseTimeContainer}>
                    <Text style={styles.responseTimeLabel}>Average Response Time:</Text>
                    <Text style={styles.responseTimeValue}>{department.average_response_time} hours</Text>
                  </View>
                  
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('DepartmentDetails', { departmentId: department.id })}
                    style={styles.viewDetailsButton}
                  >
                    View Details
                  </Button>
                </Card.Content>
              </Card>
            ))}
            
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sortMenu: {
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  allocationBarContainer: {
    marginBottom: theme.spacing.md,
  },
  allocationBar: {
    height: 20,
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  allocationSegment: {
    height: '100%',
  },
  allocationLegend: {
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
  roleDistribution: {
    marginTop: theme.spacing.md,
  },
  roleDistributionTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.sm,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  roleName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.foreground,
    width: 80,
  },
  roleBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.muted,
    borderRadius: 5,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
  },
  roleBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  roleCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.foreground,
    width: 30,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.md,
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
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  departmentHeadcount: {
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
  divider: {
    marginVertical: theme.spacing.sm,
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
    fontSize: theme.fontSizes.lg,
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
    marginBottom: theme.spacing.md,
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
  viewDetailsButton: {
    alignSelf: 'flex-end',
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

export default DepartmentAnalysisScreen;
