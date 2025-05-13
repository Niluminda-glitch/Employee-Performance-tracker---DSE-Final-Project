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
  Searchbar,
  Menu,
  List,
  FAB,
  Modal,
  Portal,
  TextInput,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for users
const mockUsers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    job_title: 'Software Developer',
    role: 'employee',
    status: 'active',
    department: 'Engineering',
    supervisor: 'Sarah Supervisor',
    avatar_url: null,
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    job_title: 'UI/UX Designer',
    role: 'employee',
    status: 'active',
    department: 'Design',
    supervisor: 'Mike Manager',
    avatar_url: null,
  },
  {
    id: '3',
    full_name: 'Alice Williams',
    email: 'alice.williams@example.com',
    job_title: 'QA Engineer',
    role: 'employee',
    status: 'active',
    department: 'Engineering',
    supervisor: 'Sarah Supervisor',
    avatar_url: null,
  },
  {
    id: '4',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    job_title: 'Frontend Developer',
    role: 'employee',
    status: 'inactive',
    department: 'Engineering',
    supervisor: 'Sarah Supervisor',
    avatar_url: null,
  },
  {
    id: '5',
    full_name: 'Sarah Supervisor',
    email: 'sarah.supervisor@example.com',
    job_title: 'Team Lead',
    role: 'supervisor',
    status: 'active',
    department: 'Engineering',
    supervisor: 'Mike Manager',
    avatar_url: null,
  },
  {
    id: '6',
    full_name: 'Mike Manager',
    email: 'mike.manager@example.com',
    job_title: 'Department Head',
    role: 'manager',
    status: 'active',
    department: 'Design',
    supervisor: null,
    avatar_url: null,
  },
];

// Mock data for departments
const mockDepartments = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'HR' },
];

const UserManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Form state for new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserJobTitle, setNewUserJobTitle] = useState('');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserSupervisor, setNewUserSupervisor] = useState('');
  
  // Form state for edit user
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserJobTitle, setEditUserJobTitle] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [editUserSupervisor, setEditUserSupervisor] = useState('');
  const [editUserStatus, setEditUserStatus] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...users];
    
    // Apply role filter
    if (activeFilter === 'employee') {
      result = result.filter(user => user.role === 'employee');
    } else if (activeFilter === 'supervisor') {
      result = result.filter(user => user.role === 'supervisor');
    } else if (activeFilter === 'manager') {
      result = result.filter(user => user.role === 'manager');
    } else if (activeFilter === 'active') {
      result = result.filter(user => user.status === 'active');
    } else if (activeFilter === 'inactive') {
      result = result.filter(user => user.status === 'inactive');
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.job_title.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, activeFilter]);

  // Fetch users (mock implementation)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
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

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserMenuVisible(true);
  };

  // Create new user
  const createUser = () => {
    // Validate form
    if (!newUserName.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    
    if (!newUserEmail.trim()) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }
    
    if (!newUserJobTitle.trim()) {
      Alert.alert('Error', 'Please enter a job title.');
      return;
    }
    
    if (!newUserDepartment) {
      Alert.alert('Error', 'Please select a department.');
      return;
    }
    
    // In a real app, this would be an API call
    // For now, we'll just add it to our local state
    const newUser = {
      id: Date.now().toString(),
      full_name: newUserName,
      email: newUserEmail,
      job_title: newUserJobTitle,
      role: newUserRole,
      status: 'active',
      department: newUserDepartment,
      supervisor: newUserSupervisor,
      avatar_url: null,
    };
    
    setUsers([newUser, ...users]);
    
    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserJobTitle('');
    setNewUserRole('employee');
    setNewUserDepartment('');
    setNewUserSupervisor('');
    
    setCreateModalVisible(false);
    
    Alert.alert('Success', 'User created successfully.');
  };

  // Edit user
  const editUser = () => {
    if (!selectedUser) return;
    
    // Validate form
    if (!editUserName.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    
    if (!editUserEmail.trim()) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }
    
    if (!editUserJobTitle.trim()) {
      Alert.alert('Error', 'Please enter a job title.');
      return;
    }
    
    if (!editUserDepartment) {
      Alert.alert('Error', 'Please select a department.');
      return;
    }
    
    // In a real app, this would be an API call
    // For now, we'll just update our local state
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          full_name: editUserName,
          email: editUserEmail,
          job_title: editUserJobTitle,
          role: editUserRole,
          status: editUserStatus,
          department: editUserDepartment,
          supervisor: editUserSupervisor,
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setEditModalVisible(false);
    setSelectedUser(null);
    
    Alert.alert('Success', 'User updated successfully.');
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUserName(user.full_name);
    setEditUserEmail(user.email);
    setEditUserJobTitle(user.job_title);
    setEditUserRole(user.role);
    setEditUserStatus(user.status);
    setEditUserDepartment(user.department);
    setEditUserSupervisor(user.supervisor || '');
    setEditModalVisible(true);
    setUserMenuVisible(false);
  };

  // Toggle user status
  const toggleUserStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    // In a real app, this would be an API call
    // For now, we'll just update our local state
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: newStatus,
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setUserMenuVisible(false);
    
    Alert.alert('Success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    let color;
    switch (role) {
      case 'manager':
        color = theme.colors.primary;
        break;
      case 'supervisor':
        color = theme.colors.info;
        break;
      case 'employee':
        color = theme.colors.success;
        break;
      default:
        color = theme.colors.muted;
    }

    return (
      <Badge
        style={[styles.roleBadge, { backgroundColor: color }]}
      >
        {role}
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'active':
        color = theme.colors.success;
        break;
      case 'inactive':
        color = theme.colors.destructive;
        break;
      case 'first_login':
        color = theme.colors.warning;
        break;
      default:
        color = theme.colors.muted;
    }

    return (
      <Badge
        style={[styles.statusBadge, { backgroundColor: color }]}
      >
        {status}
      </Badge>
    );
  };

  // Render user card
  const renderUserCard = (user) => (
    <Card key={user.id} style={styles.userCard} onPress={() => handleUserSelect(user)}>
      <Card.Content>
        <View style={styles.userHeader}>
          <Avatar.Text
            size={50}
            label={(user.full_name || 'U').substring(0, 2).toUpperCase()}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user.full_name}</Title>
            <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
          </View>
          {renderRoleBadge(user.role)}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Job Title:</Text>
            <Text style={styles.detailValue}>{user.job_title}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>{user.department}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              {renderStatusBadge(user.status)}
            </View>
          </View>
          
          {user.supervisor && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supervisor:</Text>
              <Text style={styles.detailValue}>{user.supervisor}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userActions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => openEditModal(user)}
            style={styles.userActionButton}
          >
            Edit
          </Button>
          
          <Button
            mode="outlined"
            icon={user.status === 'active' ? 'account-cancel' : 'account-check'}
            onPress={() => toggleUserStatus(user.id, user.status)}
            style={[
              styles.userActionButton,
              { borderColor: user.status === 'active' ? theme.colors.destructive : theme.colors.success }
            ]}
            labelStyle={{ 
              color: user.status === 'active' ? theme.colors.destructive : theme.colors.success 
            }}
          >
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
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
              title="All Users"
              onPress={() => handleFilterSelect('all')}
              leadingIcon="account-group"
            />
            <Menu.Item
              title="Employees"
              onPress={() => handleFilterSelect('employee')}
              leadingIcon="account"
            />
            <Menu.Item
              title="Supervisors"
              onPress={() => handleFilterSelect('supervisor')}
              leadingIcon="account-tie"
            />
            <Menu.Item
              title="Managers"
              onPress={() => handleFilterSelect('manager')}
              leadingIcon="account-star"
            />
            <Divider />
            <Menu.Item
              title="Active Users"
              onPress={() => handleFilterSelect('active')}
              leadingIcon="account-check"
            />
            <Menu.Item
              title="Inactive Users"
              onPress={() => handleFilterSelect('inactive')}
              leadingIcon="account-cancel"
            />
          </Menu>
        </View>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search users"
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
          All Users
        </Chip>
        <Chip
          selected={activeFilter === 'employee'}
          onPress={() => handleFilterSelect('employee')}
          style={styles.filterChip}
        >
          Employees
        </Chip>
        <Chip
          selected={activeFilter === 'supervisor'}
          onPress={() => handleFilterSelect('supervisor')}
          style={styles.filterChip}
        >
          Supervisors
        </Chip>
        <Chip
          selected={activeFilter === 'manager'}
          onPress={() => handleFilterSelect('manager')}
          style={styles.filterChip}
        >
          Managers
        </Chip>
        <Chip
          selected={activeFilter === 'active'}
          onPress={() => handleFilterSelect('active')}
          style={styles.filterChip}
        >
          Active
        </Chip>
        <Chip
          selected={activeFilter === 'inactive'}
          onPress={() => handleFilterSelect('inactive')}
          style={styles.filterChip}
        >
          Inactive
        </Chip>
      </ScrollView>
      
      {/* Users List */}
      <ScrollView
        style={styles.usersContainer}
        contentContainerStyle={styles.usersContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          filteredUsers.map(user => renderUserCard(user))
        )}
      </ScrollView>
      
      {/* Create User FAB */}
      <FAB
        style={styles.fab}
        icon="account-plus"
        onPress={() => setCreateModalVisible(true)}
        color={theme.colors.background}
      />
      
      {/* User Action Menu */}
      {selectedUser && (
        <Menu
          visible={userMenuVisible}
          onDismiss={() => setUserMenuVisible(false)}
          anchor={<View />}
          style={styles.userMenu}
        >
          <Menu.Item
            title="Edit User"
            onPress={() => openEditModal(selectedUser)}
            leadingIcon="pencil"
          />
          <Menu.Item
            title={selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
            onPress={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
            leadingIcon={selectedUser.status === 'active' ? 'account-cancel' : 'account-check'}
          />
          <Menu.Item
            title="View Details"
            onPress={() => {
              setUserMenuVisible(false);
              // Navigate to user details
              // navigation.navigate('UserDetails', { userId: selectedUser.id });
            }}
            leadingIcon="eye"
          />
        </Menu>
      )}
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
  usersContainer: {
    flex: 1,
  },
  usersContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
    paddingBottom: theme.spacing.xl * 3, // Extra space for FAB
  },
  userCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  userEmail: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  roleBadge: {
    borderRadius: theme.borderRadius.full,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  userDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.mutedForeground,
    width: 100,
  },
  detailValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    flex: 1,
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userActionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  userMenu: {
    marginTop: 40,
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

export default UserManagementScreen;
