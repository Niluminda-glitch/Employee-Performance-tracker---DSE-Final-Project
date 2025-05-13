import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const AnalyticsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const screenWidth = Dimensions.get('window').width - 40; // Account for padding

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Mock function to fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockData = {
        taskCompletion: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            {
              data: [12, 15, 10, 18, 14],
              color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
              strokeWidth: 2
            }
          ]
        },
        performanceByDepartment: {
          labels: ["Engineering", "Marketing", "Support"],
          data: [0.85, 0.76, 0.92]
        },
        leaveRequests: {
          labels: ["Approved", "Pending", "Rejected"],
          data: [20, 10, 5]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Chart configurations
  const lineChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#7c3aed',
    },
  };

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1, index) => {
      const colors = ['#7c3aed', '#3b82f6', '#ef4444'];
      return colors[index % colors.length] + (opacity < 1 ? opacity * 255 : '');
    },
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <Text style={styles.title}>Performance Analytics</Text>
      <Text style={styles.subtitle}>Track your team's performance metrics</Text>

      {loading && !refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : analyticsData ? (
        <>
          {/* Task Completion Chart */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Task Completion Trend</Title>
              <Paragraph style={styles.cardDescription}>Daily completed tasks over the past week</Paragraph>
              
              <View style={styles.chartContainer}>
                <LineChart
                  data={analyticsData.taskCompletion}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={lineChartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Performance by Department */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Department Performance</Title>
              <Paragraph style={styles.cardDescription}>Average performance score by department</Paragraph>
              
              <View style={styles.chartContainer}>
                <BarChart
                  data={{
                    labels: analyticsData.performanceByDepartment.labels,
                    datasets: [
                      {
                        data: analyticsData.performanceByDepartment.data.map(val => val * 100)
                      }
                    ]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Leave Requests */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Leave Requests</Title>
              <Paragraph style={styles.cardDescription}>Distribution of leave request statuses</Paragraph>
              
              <View style={styles.chartContainer}>
                <PieChart
                  data={analyticsData.leaveRequests.labels.map((label, index) => ({
                    name: label,
                    population: analyticsData.leaveRequests.data[index],
                    color: index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  }))}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={pieChartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.chart}
                />
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            style={styles.exportButton}
            onPress={() => {
              // Export functionality would go here
              alert('Export functionality will be implemented in a future update.');
            }}
          >
            Export Report
          </Button>
        </>
      ) : (
        <Text style={styles.emptyText}>No analytics data available.</Text>
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
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  cardDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  exportButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  loader: {
    marginVertical: theme.spacing.xl,
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

export default AnalyticsScreen;
