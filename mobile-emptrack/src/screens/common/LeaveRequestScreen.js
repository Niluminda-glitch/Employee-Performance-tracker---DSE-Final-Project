import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Chip, TextInput, Modal, Portal } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const LeaveRequestScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New leave request form state
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [reason, setReason] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Mock function to fetch leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockLeaveRequests = [
        {
          id: '1',
          type: 'annual',
          start_date: '2023-06-15',
          end_date: '2023-06-20',
          reason: 'Family vacation',
          status: 'approved',
          created_at: '2023-05-20',
        },
        {
          id: '2',
          type: 'sick',
          start_date: '2023-07-05',
          end_date: '2023-07-06',
          reason: 'Doctor appointment',
          status: 'pending',
          created_at: '2023-06-28',
        },
        {
          id: '3',
          type: 'personal',
          start_date: '2023-08-10',
          end_date: '2023-08-10',
          reason: 'Personal matters',
          status: 'rejected',
          created_at: '2023-07-25',
          rejection_reason: 'High workload during this period',
        },
      ];

      setLeaveRequests(mockLeaveRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Failed to load leave requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaveRequests();
  };

  // Submit new leave request
  const submitLeaveRequest = async () => {
    // Validate form
    if (!leaveType || !startDate || !endDate || !reason) {
      alert('Please fill in all fields');
      return;
    }

    if (endDate < startDate) {
      alert('End date cannot be before start date');
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new leave request object
      const newLeaveRequest = {
        id: Date.now().toString(),
        type: leaveType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        reason: reason,
        status: 'pending',
        created_at: new Date().toISOString().split('T')[0],
      };

      // Add to state
      setLeaveRequests([newLeaveRequest, ...leaveRequests]);

      // Reset form
      setLeaveType('annual');
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 86400000));
      setReason('');

      // Close modal
      setModalVisible(false);

      alert('Leave request submitted successfully!');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel leave request
  const cancelLeaveRequest = (id) => {
    // In a real app, this would send a request to the backend
    setLeaveRequests(leaveRequests.filter(request => request.id !== id));
    alert('Leave request cancelled successfully!');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'rejected':
        return theme.colors.destructive;
      default:
        return theme.colors.muted;
    }
  };

  // Get leave type label
  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case 'annual':
        return 'Annual Leave';
      case 'sick':
        return 'Sick Leave';
      case 'personal':
        return 'Personal Leave';
      case 'unpaid':
        return 'Unpaid Leave';
      default:
        return type;
    }
  };

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Leave Requests</Text>
            <Text style={styles.subtitle}>Manage your time off</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => setModalVisible(true)}
            style={styles.newRequestButton}
          >
            New Request
          </Button>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : leaveRequests.length === 0 ? (
          <Text style={styles.emptyText}>No leave requests found.</Text>
        ) : (
          leaveRequests.map(request => (
            <Card key={request.id} style={styles.requestCard}>
              <Card.Content>
                <View style={styles.requestHeader}>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + '20' }]}
                    textStyle={{ color: getStatusColor(request.status) }}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Chip>
                  <Text style={styles.dateSubmitted}>Submitted: {formatDate(request.created_at)}</Text>
                </View>

                <Title style={styles.leaveType}>{getLeaveTypeLabel(request.type)}</Title>

                <View style={styles.dateRange}>
                  <Text style={styles.dateRangeText}>
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </Text>
                </View>

                <View style={styles.reasonSection}>
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <Text style={styles.reasonText}>{request.reason}</Text>
                </View>

                {request.status === 'rejected' && request.rejection_reason && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectionText}>{request.rejection_reason}</Text>
                  </View>
                )}

                {request.status === 'pending' && (
                  <Button
                    mode="outlined"
                    onPress={() => cancelLeaveRequest(request.id)}
                    style={styles.cancelButton}
                    color={theme.colors.destructive}
                  >
                    Cancel Request
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* New Leave Request Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>New Leave Request</Title>

            <Text style={styles.inputLabel}>Leave Type</Text>
            <View style={styles.leaveTypeContainer}>
              {['annual', 'sick', 'personal', 'unpaid'].map(type => (
                <Chip
                  key={type}
                  selected={leaveType === type}
                  onPress={() => setLeaveType(type)}
                  style={styles.leaveTypeChip}
                  selectedColor={theme.colors.primary}
                >
                  {getLeaveTypeLabel(type)}
                </Chip>
              ))}
            </View>

            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.inputLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{endDate.toDateString()}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}

            <Text style={styles.inputLabel}>Reason</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              style={styles.reasonInput}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Please provide a reason for your leave request"
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelModalButton]}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={submitLeaveRequest}
                style={[styles.modalButton, styles.submitButton]}
                loading={loading}
                disabled={loading}
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
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.mutedForeground,
  },
  newRequestButton: {
    backgroundColor: theme.colors.primary,
  },
  requestCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusChip: {
    borderRadius: theme.borderRadius.full,
  },
  dateSubmitted: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  leaveType: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  dateRange: {
    marginBottom: theme.spacing.sm,
  },
  dateRangeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.foreground,
  },
  reasonSection: {
    marginBottom: theme.spacing.sm,
  },
  reasonLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  reasonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  rejectionSection: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.destructive + '10',
    borderRadius: theme.borderRadius.md,
  },
  rejectionLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.destructive,
    marginBottom: theme.spacing.xs,
  },
  rejectionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    borderColor: theme.colors.destructive,
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
  modalContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    marginBottom: theme.spacing.xs,
    color: theme.colors.foreground,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  leaveTypeChip: {
    margin: theme.spacing.xs,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reasonInput: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    margin: theme.spacing.xs,
  },
  cancelModalButton: {
    borderColor: theme.colors.muted,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default LeaveRequestScreen;
