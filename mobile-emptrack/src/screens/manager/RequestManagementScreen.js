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
  Modal,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for requests
const mockRequests = [
  {
    id: '1',
    type: 'leave',
    status: 'pending',
    employee: {
      id: '1',
      full_name: 'John Doe',
      department: 'Engineering',
      avatar_url: null,
    },
    start_date: '2023-06-10',
    end_date: '2023-06-15',
    reason: 'Annual vacation',
    created_at: '2023-05-20T10:30:00Z',
  },
  {
    id: '2',
    type: 'overtime',
    status: 'pending',
    employee: {
      id: '2',
      full_name: 'Jane Smith',
      department: 'Design',
      avatar_url: null,
    },
    date: '2023-06-05',
    hours: 3,
    reason: 'Project deadline',
    created_at: '2023-05-25T09:15:00Z',
  },
  {
    id: '3',
    type: 'leave',
    status: 'approved',
    employee: {
      id: '3',
      full_name: 'Alice Williams',
      department: 'Marketing',
      avatar_url: null,
    },
    start_date: '2023-07-01',
    end_date: '2023-07-03',
    reason: 'Personal matters',
    created_at: '2023-05-15T11:45:00Z',
    approved_by: 'Sarah Supervisor',
    approved_at: '2023-05-16T16:30:00Z',
  },
  {
    id: '4',
    type: 'overtime',
    status: 'rejected',
    employee: {
      id: '1',
      full_name: 'John Doe',
      department: 'Engineering',
      avatar_url: null,
    },
    date: '2023-06-20',
    hours: 2,
    reason: 'System maintenance',
    created_at: '2023-06-01T08:30:00Z',
    rejected_by: 'Sarah Supervisor',
    rejected_at: '2023-06-02T10:15:00Z',
    rejection_reason: 'Not enough workload to justify overtime',
  },
  {
    id: '5',
    type: 'leave',
    status: 'pending',
    employee: {
      id: '4',
      full_name: 'Bob Johnson',
      department: 'HR',
      avatar_url: null,
    },
    start_date: '2023-06-25',
    end_date: '2023-06-30',
    reason: 'Family vacation',
    created_at: '2023-06-05T14:20:00Z',
  },
];

// Mock data for departments
const mockDepartments = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'HR' },
];

const RequestManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...requests];
    
    // Apply status filter
    if (activeFilter === 'pending') {
      result = result.filter(request => request.status === 'pending');
    } else if (activeFilter === 'approved') {
      result = result.filter(request => request.status === 'approved');
    } else if (activeFilter === 'rejected') {
      result = result.filter(request => request.status === 'rejected');
    } else if (activeFilter === 'leave') {
      result = result.filter(request => request.type === 'leave');
    } else if (activeFilter === 'overtime') {
      result = result.filter(request => request.type === 'overtime');
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(request => request.employee.department === departmentFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        request =>
          request.employee.full_name.toLowerCase().includes(query) ||
          request.reason.toLowerCase().includes(query) ||
          request.employee.department.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(result);
  }, [requests, searchQuery, activeFilter, departmentFilter]);

  // Fetch requests (mock implementation)
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setRequests(mockRequests);
        setFilteredRequests(mockRequests);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
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

  // Handle department filter selection
  const handleDepartmentSelect = (department) => {
    setDepartmentFilter(department);
    setDepartmentMenuVisible(false);
  };

  // Approve request
  const approveRequest = (requestId) => {
    // In a real app, this would be an API call
    // For now, we'll just update our local state
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: 'approved',
          approved_by: user.full_name,
          approved_at: new Date().toISOString(),
        };
      }
      return request;
    });
    
    setRequests(updatedRequests);
    
    Alert.alert('Success', 'Request approved successfully.');
  };

  // Reject request
  const rejectRequest = () => {
    if (!selectedRequest) return;
    
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection.');
      return;
    }
    
    // In a real app, this would be an API call
    // For now, we'll just update our local state
    const updatedRequests = requests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: 'rejected',
          rejected_by: user.full_name,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        };
      }
      return request;
    });
    
    setRequests(updatedRequests);
    setRejectModalVisible(false);
    setRejectionReason('');
    setSelectedRequest(null);
    
    Alert.alert('Success', 'Request rejected successfully.');
  };

  // Render type badge
  const renderTypeBadge = (type) => {
    let color = type === 'leave' ? theme.colors.info : theme.colors.warning;

    return (
      <Badge
        style={[styles.typeBadge, { backgroundColor: color }]}
      >
        {type}
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'approved':
        color = theme.colors.success;
        break;
      case 'pending':
        color = theme.colors.warning;
        break;
      case 'rejected':
        color = theme.colors.destructive;
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

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString();
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  // Render request card
  const renderRequestCard = (request) => (
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
          {renderTypeBadge(request.type)}
        </View>
        
        <View style={styles.employeeContainer}>
          <View style={styles.employeeInfo}>
            <Avatar.Text
              size={24}
              label={(request.employee.full_name || 'U').substring(0, 2).toUpperCase()}
              style={styles.employeeAvatar}
            />
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>{request.employee.full_name}</Text>
              <Text style={styles.departmentName}>{request.employee.department}</Text>
            </View>
          </View>
          {renderStatusBadge(request.status)}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.requestDetails}>
          {request.type === 'leave' ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date Range:</Text>
              <Text style={styles.detailValue}>
                {formatDateRange(request.start_date, request.end_date)}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(request.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hours:</Text>
                <Text style={styles.detailValue}>{request.hours}</Text>
              </View>
            </>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason:</Text>
            <Text style={styles.detailValue}>{request.reason}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted:</Text>
            <Text style={styles.detailValue}>
              {new Date(request.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          {request.status === 'approved' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Approved By:</Text>
              <Text style={styles.detailValue}>{request.approved_by}</Text>
            </View>
          )}
          
          {request.status === 'rejected' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rejected By:</Text>
                <Text style={styles.detailValue}>{request.rejected_by}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reason:</Text>
                <Text style={styles.detailValue}>{request.rejection_reason}</Text>
              </View>
            </>
          )}
        </View>
        
        {request.status === 'pending' && (
          <View style={styles.requestActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedRequest(request);
                setRejectModalVisible(true);
              }}
              style={[styles.actionButton, styles.rejectButton]}
              labelStyle={styles.rejectButtonLabel}
            >
              Reject
            </Button>
            <Button
              mode="contained"
              onPress={() => approveRequest(request.id)}
              style={[styles.actionButton, styles.approveButton]}
            >
              Approve
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Management</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterMenuVisible(true)}
            color={theme.colors.primary}
          />
          <IconButton
            icon="office-building"
            size={24}
            onPress={() => setDepartmentMenuVisible(true)}
            color={theme.colors.primary}
          />
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={<View />}
            style={styles.filterMenu}
          >
            <Menu.Item
              title="All Requests"
              onPress={() => handleFilterSelect('all')}
              leadingIcon="calendar-clock"
            />
            <Menu.Item
              title="Pending Requests"
              onPress={() => handleFilterSelect('pending')}
              leadingIcon="clock-outline"
            />
            <Menu.Item
              title="Approved Requests"
              onPress={() => handleFilterSelect('approved')}
              leadingIcon="check-circle"
            />
            <Menu.Item
              title="Rejected Requests"
              onPress={() => handleFilterSelect('rejected')}
              leadingIcon="close-circle"
            />
            <Divider />
            <Menu.Item
              title="Leave Requests"
              onPress={() => handleFilterSelect('leave')}
              leadingIcon="calendar"
            />
            <Menu.Item
              title="Overtime Requests"
              onPress={() => handleFilterSelect('overtime')}
              leadingIcon="clock"
            />
          </Menu>
          <Menu
            visible={departmentMenuVisible}
            onDismiss={() => setDepartmentMenuVisible(false)}
            anchor={<View />}
            style={styles.departmentMenu}
          >
            <Menu.Item
              title="All Departments"
              onPress={() => handleDepartmentSelect('all')}
              leadingIcon="office-building"
            />
            {mockDepartments.map(department => (
              <Menu.Item
                key={department.id}
                title={department.name}
                onPress={() => handleDepartmentSelect(department.name)}
                leadingIcon="office-building"
              />
            ))}
          </Menu>
        </View>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search requests"
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
          All
        </Chip>
        <Chip
          selected={activeFilter === 'pending'}
          onPress={() => handleFilterSelect('pending')}
          style={styles.filterChip}
        >
          Pending
        </Chip>
        <Chip
          selected={activeFilter === 'approved'}
          onPress={() => handleFilterSelect('approved')}
          style={styles.filterChip}
        >
          Approved
        </Chip>
        <Chip
          selected={activeFilter === 'rejected'}
          onPress={() => handleFilterSelect('rejected')}
          style={styles.filterChip}
        >
          Rejected
        </Chip>
        <Chip
          selected={activeFilter === 'leave'}
          onPress={() => handleFilterSelect('leave')}
          style={styles.filterChip}
        >
          Leave
        </Chip>
        <Chip
          selected={activeFilter === 'overtime'}
          onPress={() => handleFilterSelect('overtime')}
          style={styles.filterChip}
        >
          Overtime
        </Chip>
      </ScrollView>
      
      {/* Department Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <Chip
          selected={departmentFilter === 'all'}
          onPress={() => handleDepartmentSelect('all')}
          style={styles.filterChip}
        >
          All Departments
        </Chip>
        {mockDepartments.map(department => (
          <Chip
            key={department.id}
            selected={departmentFilter === department.name}
            onPress={() => handleDepartmentSelect(department.name)}
            style={styles.filterChip}
          >
            {department.name}
          </Chip>
        ))}
      </ScrollView>
      
      {/* Requests List */}
      <ScrollView
        style={styles.requestsContainer}
        contentContainerStyle={styles.requestsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredRequests.length === 0 ? (
          <Text style={styles.emptyText}>No requests found.</Text>
        ) : (
          filteredRequests.map(request => renderRequestCard(request))
        )}
      </ScrollView>
      
      {/* Reject Request Modal */}
      <Portal>
        <Modal
          visible={rejectModalVisible}
          onDismiss={() => {
            setRejectModalVisible(false);
            setRejectionReason('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Reject Request</Title>
          
          <Paragraph style={styles.modalDescription}>
            Please provide a reason for rejecting this request.
          </Paragraph>
          
          <TextInput
            label="Rejection Reason"
            value={rejectionReason}
            onChangeText={setRejectionReason}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalButtonsContainer}>
            <Button
              mode="outlined"
              onPress={() => {
                setRejectModalVisible(false);
                setRejectionReason('');
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={rejectRequest}
              style={[styles.modalButton, { backgroundColor: theme.colors.destructive }]}
            >
              Reject
            </Button>
          </View>
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  filterMenu: {
    marginTop: 40,
  },
  departmentMenu: {
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
  requestsContainer: {
    flex: 1,
  },
  requestsContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
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
  typeBadge: {
    borderRadius: theme.borderRadius.full,
  },
  employeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  departmentName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  requestDetails: {
    marginVertical: theme.spacing.sm,
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
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  actionButton: {
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
  modalContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.mutedForeground,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default RequestManagementScreen;
