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
  Button,
  ActivityIndicator,
  TextInput,
  Chip,
  RadioButton,
  Divider,
  Menu,
  IconButton,
  List,
  Modal,
  Portal,
  SegmentedButtons,
  Badge,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for leave requests
const mockRequests = [
  {
    id: '1',
    type: 'leave',
    status: 'approved',
    start_date: '2023-06-10',
    end_date: '2023-06-15',
    reason: 'Annual vacation',
    created_at: '2023-05-20T10:30:00Z',
    approved_by: 'John Manager',
    approved_at: '2023-05-22T14:20:00Z',
  },
  {
    id: '2',
    type: 'overtime',
    status: 'pending',
    date: '2023-06-05',
    hours: 3,
    reason: 'Project deadline',
    created_at: '2023-05-25T09:15:00Z',
  },
  {
    id: '3',
    type: 'leave',
    status: 'rejected',
    start_date: '2023-07-01',
    end_date: '2023-07-03',
    reason: 'Personal matters',
    created_at: '2023-05-15T11:45:00Z',
    rejected_by: 'Sarah Supervisor',
    rejected_at: '2023-05-16T16:30:00Z',
    rejection_reason: 'Critical project deadline during this period',
  },
];

const LeaveRequestScreen = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [requestType, setRequestType] = useState('leave');
  
  // Form state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch requests (mock implementation)
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setRequests(mockRequests);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'leave') return request.type === 'leave';
    if (activeTab === 'overtime') return request.type === 'overtime';
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return request.status === 'approved';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
    
    // If end date is before start date, update end date
    if (endDate < currentDate) {
      setEndDate(currentDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Submit request
  const submitRequest = () => {
    // Validate form
    if (requestType === 'leave') {
      if (!reason.trim()) {
        Alert.alert('Error', 'Please provide a reason for your leave request.');
        return;
      }
    } else if (requestType === 'overtime') {
      if (!hours.trim() || isNaN(hours) || Number(hours) <= 0) {
        Alert.alert('Error', 'Please enter a valid number of hours.');
        return;
      }
      if (!reason.trim()) {
        Alert.alert('Error', 'Please provide a reason for your overtime request.');
        return;
      }
    }

    // In a real app, this would be an API call to create the request
    // For now, we'll just add it to our local state
    const newRequest = {
      id: Date.now().toString(),
      type: requestType,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (requestType === 'leave') {
      newRequest.start_date = startDate.toISOString().split('T')[0];
      newRequest.end_date = endDate.toISOString().split('T')[0];
    } else {
      newRequest.date = startDate.toISOString().split('T')[0];
      newRequest.hours = Number(hours);
    }

    newRequest.reason = reason;

    setRequests([newRequest, ...requests]);
    setModalVisible(false);
    resetForm();

    Alert.alert(
      'Success',
      `Your ${requestType} request has been submitted and is pending approval.`
    );
  };

  // Reset form
  const resetForm = () => {
    setRequestType('leave');
    setStartDate(new Date());
    setEndDate(new Date());
    setHours('');
    setReason('');
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
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'leave', label: 'Leave' },
          { value: 'overtime', label: 'Overtime' },
        ]}
        style={styles.segmentedButtons}
      />
      
      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={activeTab === 'pending'}
            onPress={() => setActiveTab('pending')}
            style={styles.filterChip}
          >
            Pending
          </Chip>
          <Chip
            selected={activeTab === 'approved'}
            onPress={() => setActiveTab('approved')}
            style={styles.filterChip}
          >
            Approved
          </Chip>
          <Chip
            selected={activeTab === 'rejected'}
            onPress={() => setActiveTab('rejected')}
            style={styles.filterChip}
          >
            Rejected
          </Chip>
        </ScrollView>
      </View>
      
      {/* Request List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : filteredRequests.length === 0 ? (
          <Text style={styles.emptyText}>No requests found.</Text>
        ) : (
          filteredRequests.map((request) => (
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
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      
      {/* New Request Button */}
      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={styles.newRequestButton}
        icon="plus"
      >
        New Request
      </Button>
      
      {/* New Request Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>New Request</Title>
            
            {/* Request Type */}
            <RadioButton.Group
              onValueChange={value => setRequestType(value)}
              value={requestType}
            >
              <View style={styles.radioButtonRow}>
                <RadioButton.Item
                  label="Leave Request"
                  value="leave"
                  position="leading"
                  style={styles.radioButtonItem}
                />
                <RadioButton.Item
                  label="Overtime Request"
                  value="overtime"
                  position="leading"
                  style={styles.radioButtonItem}
                />
              </View>
            </RadioButton.Group>
            
            <Divider style={styles.divider} />
            
            {/* Date Selection */}
            {requestType === 'leave' ? (
              <>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerLabel}>Start Date:</Text>
                  <Text style={styles.datePickerValue}>
                    {startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerLabel}>End Date:</Text>
                  <Text style={styles.datePickerValue}>
                    {endDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerLabel}>Date:</Text>
                  <Text style={styles.datePickerValue}>
                    {startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <TextInput
                  label="Hours"
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
              </>
            )}
            
            {/* Date Pickers */}
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
            
            {/* Reason */}
            <TextInput
              label="Reason"
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            {/* Buttons */}
            <View style={styles.modalButtonsContainer}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={submitRequest}
                style={styles.modalButton}
              >
                Submit
              </Button>
            </View>
          </ScrollView>
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
  segmentedButtons: {
    margin: theme.spacing.md,
  },
  statusFilterContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2, // Extra space for the FAB
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    marginVertical: theme.spacing.lg,
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
    marginBottom: theme.spacing.sm,
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
  statusBadge: {
    borderRadius: theme.borderRadius.full,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  requestDetails: {
    marginTop: theme.spacing.sm,
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
  newRequestButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  radioButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButtonItem: {
    flex: 1,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  datePickerLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  datePickerValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default LeaveRequestScreen;
