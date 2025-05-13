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
import { Card, Title, Paragraph, Avatar, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { userAPI } from '../../api/api';

const SupervisorTeamScreen = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(teamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = teamMembers.filter(
        member =>
          member.full_name?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.job_title?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, teamMembers]);

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get team members using the API
      const teamData = await userAPI.getTeamMembers();
      setTeamMembers(teamData);
      setFilteredMembers(teamData);
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

  // Mock team members data (replace with actual API data)
  const mockTeamMembers = [
    {
      id: '1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      job_title: 'Software Developer',
      status: 'active',
      performance: 85,
      tasks_completed: 12,
      tasks_in_progress: 3,
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      job_title: 'UI/UX Designer',
      status: 'active',
      performance: 92,
      tasks_completed: 15,
      tasks_in_progress: 1,
    },
    {
      id: '3',
      full_name: 'Alice Williams',
      email: 'alice.williams@example.com',
      job_title: 'QA Engineer',
      status: 'active',
      performance: 78,
      tasks_completed: 8,
      tasks_in_progress: 4,
    },
    {
      id: '4',
      full_name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      job_title: 'Frontend Developer',
      status: 'active',
      performance: 80,
      tasks_completed: 10,
      tasks_in_progress: 2,
    },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search team members..."
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
        ) : filteredMembers.length === 0 ? (
          <Text style={styles.emptyText}>No team members found.</Text>
        ) : (
          filteredMembers.map((member) => (
              <Card key={member.id} style={styles.memberCard}>
                <Card.Content>
                  <View style={styles.memberHeader}>
                    <Avatar.Text
                      size={50}
                      label={member.full_name.substring(0, 2).toUpperCase()}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <Title style={styles.memberName}>{member.full_name}</Title>
                      <Paragraph style={styles.memberEmail}>{member.email}</Paragraph>
                      <Text style={styles.memberJobTitle}>{member.job_title}</Text>
                    </View>
                  </View>

                  <View style={styles.performanceContainer}>
                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>{member.performance}%</Text>
                      <Text style={styles.performanceLabel}>Performance</Text>
                    </View>

                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>{member.tasks_completed}</Text>
                      <Text style={styles.performanceLabel}>Completed</Text>
                    </View>

                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>{member.tasks_in_progress}</Text>
                      <Text style={styles.performanceLabel}>In Progress</Text>
                    </View>
                  </View>

                  <View style={styles.memberActions}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        // View member tasks
                      }}
                      style={styles.actionButton}
                      icon="clipboard-list"
                    >
                      Tasks
                    </Button>

                    <Button
                      mode="outlined"
                      onPress={() => {
                        // View member performance
                      }}
                      style={styles.actionButton}
                      icon="chart-line"
                    >
                      Performance
                    </Button>

                    <Button
                      mode="outlined"
                      onPress={() => {
                        // Assign new task
                      }}
                      style={styles.actionButton}
                      icon="plus"
                    >
                      Assign
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
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
  searchBar: {
    margin: theme.spacing.md,
    elevation: 0,
    backgroundColor: theme.colors.card,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  memberCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
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
  memberEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  memberJobTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  performanceLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  emptyText: {
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
});

export default SupervisorTeamScreen;
