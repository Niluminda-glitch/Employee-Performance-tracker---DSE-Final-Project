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
import { Card, Title, Paragraph, Avatar, Button, ActivityIndicator, FAB, Searchbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { userAPI } from '../../api/api';

const ManagerUsersScreen = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user => 
          user.full_name?.toLowerCase().includes(query) || 
          user.email?.toLowerCase().includes(query) ||
          user.job_title?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userAPI.getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Handle add user
  const handleAddUser = () => {
    Alert.alert('Add User', 'This feature will be implemented soon!');
  };

  // Mock users data (replace with actual API data)
  const mockUsers = [
    {
      id: '1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'employee',
      job_title: 'Software Developer',
      status: 'active',
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'employee',
      job_title: 'UI/UX Designer',
      status: 'active',
    },
    {
      id: '3',
      full_name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'supervisor',
      job_title: 'Team Lead',
      status: 'active',
    },
    {
      id: '4',
      full_name: 'Alice Williams',
      email: 'alice.williams@example.com',
      role: 'employee',
      job_title: 'QA Engineer',
      status: 'inactive',
    },
    {
      id: '5',
      full_name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'employee',
      job_title: 'Frontend Developer',
      status: 'first_login',
    },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
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
        ) : mockUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          mockUsers
            .filter(user => 
              searchQuery === '' || 
              user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.job_title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((user) => (
              <Card key={user.id} style={styles.userCard}>
                <Card.Content>
                  <View style={styles.userHeader}>
                    <Avatar.Text
                      size={50}
                      label={user.full_name.substring(0, 2).toUpperCase()}
                      style={[
                        styles.userAvatar,
                        user.status === 'inactive' && styles.inactiveAvatar,
                      ]}
                    />
                    <View style={styles.userInfo}>
                      <Title style={styles.userName}>{user.full_name}</Title>
                      <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
                      <View style={styles.userDetails}>
                        <View style={styles.userDetailItem}>
                          <Text style={styles.userDetailLabel}>Role:</Text>
                          <Text style={styles.userDetailValue}>{user.role}</Text>
                        </View>
                        <View style={styles.userDetailItem}>
                          <Text style={styles.userDetailLabel}>Job Title:</Text>
                          <Text style={styles.userDetailValue}>{user.job_title}</Text>
                        </View>
                        <View style={styles.userDetailItem}>
                          <Text style={styles.userDetailLabel}>Status:</Text>
                          <Text
                            style={[
                              styles.userDetailValue,
                              user.status === 'active' && styles.activeStatus,
                              user.status === 'inactive' && styles.inactiveStatus,
                              user.status === 'first_login' && styles.firstLoginStatus,
                            ]}
                          >
                            {user.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.userActions}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        // View user details
                      }}
                      style={styles.actionButton}
                    >
                      View
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => {
                        // Edit user
                      }}
                      style={styles.actionButton}
                    >
                      Edit
                    </Button>
                    
                    {user.status === 'active' ? (
                      <Button
                        mode="outlined"
                        onPress={() => {
                          // Deactivate user
                        }}
                        style={[styles.actionButton, styles.deactivateButton]}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        mode="outlined"
                        onPress={() => {
                          // Activate user
                        }}
                        style={[styles.actionButton, styles.activateButton]}
                      >
                        Activate
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
        icon="account-plus"
        onPress={handleAddUser}
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
  userCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  userAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  inactiveAvatar: {
    backgroundColor: theme.colors.muted,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  userEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  userDetails: {
    marginTop: theme.spacing.xs,
  },
  userDetailItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  userDetailLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginRight: theme.spacing.xs,
    width: 70,
  },
  userDetailValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  activeStatus: {
    color: theme.colors.success,
  },
  inactiveStatus: {
    color: theme.colors.destructive,
  },
  firstLoginStatus: {
    color: theme.colors.warning,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  deactivateButton: {
    borderColor: theme.colors.destructive,
  },
  activateButton: {
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

export default ManagerUsersScreen;
