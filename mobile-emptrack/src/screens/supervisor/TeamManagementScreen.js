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
  Searchbar,
  Menu,
  List,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import { userAPI } from '../../api/api';

// Mock data for team members
const mockTeamMembers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    job_title: 'Software Developer',
    department: 'Engineering',
    status: 'active',
    performance: 85,
    tasks_completed: 12,
    tasks_in_progress: 3,
    skills: ['JavaScript', 'React', 'Node.js'],
    avatar_url: null,
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    job_title: 'UI/UX Designer',
    department: 'Design',
    status: 'active',
    performance: 92,
    tasks_completed: 15,
    tasks_in_progress: 1,
    skills: ['UI/UX Design', 'Figma', 'Adobe XD'],
    avatar_url: null,
  },
  {
    id: '3',
    full_name: 'Alice Williams',
    email: 'alice.williams@example.com',
    job_title: 'QA Engineer',
    department: 'Engineering',
    status: 'active',
    performance: 78,
    tasks_completed: 8,
    tasks_in_progress: 4,
    skills: ['Testing', 'Automation', 'QA'],
    avatar_url: null,
  },
  {
    id: '4',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    job_title: 'Frontend Developer',
    department: 'Engineering',
    status: 'inactive',
    performance: 65,
    tasks_completed: 5,
    tasks_in_progress: 2,
    skills: ['HTML', 'CSS', 'JavaScript'],
    avatar_url: null,
  },
];

const TeamManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...teamMembers];
    
    // Apply status filter
    if (activeFilter === 'active') {
      result = result.filter(member => member.status === 'active');
    } else if (activeFilter === 'inactive') {
      result = result.filter(member => member.status === 'inactive');
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member =>
          member.full_name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.job_title.toLowerCase().includes(query) ||
          member.department.toLowerCase().includes(query) ||
          (member.skills && member.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }
    
    setFilteredMembers(result);
  }, [teamMembers, searchQuery, activeFilter]);

  // Fetch team members (mock implementation)
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setTeamMembers(mockTeamMembers);
        setFilteredMembers(mockTeamMembers);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamMembers();
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

  // Handle member selection
  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setMemberMenuVisible(true);
  };

  // Render member card
  const renderMemberCard = (member) => (
    <Card key={member.id} style={styles.memberCard} onPress={() => handleMemberSelect(member)}>
      <Card.Content>
        <View style={styles.memberHeader}>
          <Avatar.Text
            size={50}
            label={(member.full_name || 'U').substring(0, 2).toUpperCase()}
            style={styles.memberAvatar}
          />
          <View style={styles.memberInfo}>
            <Title style={styles.memberName}>{member.full_name}</Title>
            <Paragraph style={styles.memberRole}>{member.job_title}</Paragraph>
            <Paragraph style={styles.memberEmail}>{member.email}</Paragraph>
          </View>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: member.status === 'active' ? theme.colors.success : theme.colors.muted }
            ]}
          >
            {member.status}
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
        
        {member.skills && member.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsTitle}>Skills:</Text>
            <View style={styles.skillsRow}>
              {member.skills.map((skill, index) => (
                <Chip key={index} style={styles.skillChip}>
                  {skill}
                </Chip>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.memberActions}>
          <Button
            mode="outlined"
            icon="clipboard-list"
            onPress={() => {
              // Navigate to member tasks
            }}
            style={styles.memberActionButton}
          >
            Tasks
          </Button>
          
          <Button
            mode="outlined"
            icon="chart-line"
            onPress={() => {
              // Navigate to member performance
            }}
            style={styles.memberActionButton}
          >
            Performance
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team Management</Text>
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
              title="All Members"
              onPress={() => handleFilterSelect('all')}
              leadingIcon="account-group"
            />
            <Menu.Item
              title="Active Members"
              onPress={() => handleFilterSelect('active')}
              leadingIcon="account-check"
            />
            <Menu.Item
              title="Inactive Members"
              onPress={() => handleFilterSelect('inactive')}
              leadingIcon="account-cancel"
            />
          </Menu>
        </View>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search team members"
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
          All Members
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
      
      {/* Team Members List */}
      <ScrollView
        style={styles.membersContainer}
        contentContainerStyle={styles.membersContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredMembers.length === 0 ? (
          <Text style={styles.emptyText}>No team members found.</Text>
        ) : (
          filteredMembers.map(member => renderMemberCard(member))
        )}
      </ScrollView>
      
      {/* Member Action Menu */}
      {selectedMember && (
        <Menu
          visible={memberMenuVisible}
          onDismiss={() => setMemberMenuVisible(false)}
          anchor={<View />}
          style={styles.memberMenu}
        >
          <Menu.Item
            title="View Profile"
            onPress={() => {
              setMemberMenuVisible(false);
              // Navigate to member profile
            }}
            leadingIcon="account-details"
          />
          <Menu.Item
            title="Assign Task"
            onPress={() => {
              setMemberMenuVisible(false);
              // Navigate to task assignment
            }}
            leadingIcon="clipboard-plus"
          />
          <Menu.Item
            title="View Performance"
            onPress={() => {
              setMemberMenuVisible(false);
              // Navigate to performance view
            }}
            leadingIcon="chart-line"
          />
          <Divider />
          <Menu.Item
            title={`${selectedMember.status === 'active' ? 'Deactivate' : 'Activate'} Account`}
            onPress={() => {
              setMemberMenuVisible(false);
              // Toggle member status
            }}
            leadingIcon={selectedMember.status === 'active' ? 'account-cancel' : 'account-check'}
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
  membersContainer: {
    flex: 1,
  },
  membersContent: {
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
  memberEmail: {
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
  skillsContainer: {
    marginVertical: theme.spacing.sm,
  },
  skillsTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
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
  memberMenu: {
    marginTop: 40,
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

export default TeamManagementScreen;
