import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  Searchbar,
  Avatar,
  Badge,
  Divider,
  IconButton,
  List,
  Modal,
  Portal,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

// Mock data for skills
const mockSkills = [
  { id: '1', name: 'JavaScript', description: 'Programming language' },
  { id: '2', name: 'React', description: 'Frontend framework' },
  { id: '3', name: 'Node.js', description: 'Backend runtime' },
  { id: '4', name: 'SQL', description: 'Database query language' },
  { id: '5', name: 'UI/UX Design', description: 'User interface design' },
  { id: '6', name: 'Project Management', description: 'Managing projects' },
  { id: '7', name: 'Communication', description: 'Effective communication' },
  { id: '8', name: 'Leadership', description: 'Team leadership' },
];

// Mock data for mentors
const mockMentors = [
  {
    id: '1',
    full_name: 'John Doe',
    job_title: 'Senior Developer',
    department: 'Engineering',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: 5,
    rating: 4.8,
    students_helped: 12,
    availability: 'High',
    avatar_url: null,
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    job_title: 'UX Designer',
    department: 'Design',
    skills: ['UI/UX Design', 'Communication'],
    experience: 3,
    rating: 4.5,
    students_helped: 8,
    availability: 'Medium',
    avatar_url: null,
  },
  {
    id: '3',
    full_name: 'Bob Johnson',
    job_title: 'Team Lead',
    department: 'Engineering',
    skills: ['JavaScript', 'Leadership', 'Project Management'],
    experience: 7,
    rating: 4.9,
    students_helped: 20,
    availability: 'Low',
    avatar_url: null,
  },
  {
    id: '4',
    full_name: 'Alice Williams',
    job_title: 'Database Administrator',
    department: 'IT',
    skills: ['SQL', 'Node.js'],
    experience: 4,
    rating: 4.6,
    students_helped: 10,
    availability: 'Medium',
    avatar_url: null,
  },
];

// Mock data for mentorship requests
const mockRequests = [
  {
    id: '1',
    mentor_id: '1',
    mentor_name: 'John Doe',
    skill: 'JavaScript',
    status: 'accepted',
    created_at: '2023-05-20T10:30:00Z',
    accepted_at: '2023-05-21T14:20:00Z',
  },
  {
    id: '2',
    mentor_id: '2',
    mentor_name: 'Jane Smith',
    skill: 'UI/UX Design',
    status: 'pending',
    created_at: '2023-05-25T09:15:00Z',
  },
  {
    id: '3',
    mentor_id: '3',
    mentor_name: 'Bob Johnson',
    skill: 'Leadership',
    status: 'rejected',
    created_at: '2023-05-15T11:45:00Z',
    rejected_at: '2023-05-16T16:30:00Z',
    rejection_reason: 'Currently at maximum mentee capacity',
  },
];

const FindMentorScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('find');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, these would be API calls
      // For now, we'll use mock data
      setTimeout(() => {
        setSkills(mockSkills);
        setMentors(mockMentors);
        setRequests(mockRequests);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle search
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  // Toggle skill selection
  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(skill => skill !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Filter mentors based on search and selected skills
  const filteredMentors = mentors.filter(mentor => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      mentor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by selected skills
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every(skill => mentor.skills.includes(skill));

    return matchesSearch && matchesSkills;
  });

  // Open mentor details modal
  const openMentorDetails = (mentor) => {
    setSelectedMentor(mentor);
    setModalVisible(true);
  };

  // Send mentorship request
  const sendRequest = (mentorId, skill) => {
    // Check if request already exists
    const existingRequest = requests.find(
      req => req.mentor_id === mentorId && req.status === 'pending'
    );

    if (existingRequest) {
      Alert.alert(
        'Request Exists',
        'You already have a pending request with this mentor.'
      );
      return;
    }

    // In a real app, this would be an API call
    // For now, we'll just add it to our local state
    const newRequest = {
      id: Date.now().toString(),
      mentor_id: mentorId,
      mentor_name: mentors.find(m => m.id === mentorId).full_name,
      skill,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setRequests([newRequest, ...requests]);
    setModalVisible(false);

    Alert.alert(
      'Request Sent',
      'Your mentorship request has been sent and is pending approval.'
    );
  };

  // Render availability badge
  const renderAvailabilityBadge = (availability) => {
    let color;
    switch (availability) {
      case 'High':
        color = theme.colors.success;
        break;
      case 'Medium':
        color = theme.colors.warning;
        break;
      case 'Low':
        color = theme.colors.destructive;
        break;
      default:
        color = theme.colors.muted;
    }

    return (
      <Badge
        style={[styles.availabilityBadge, { backgroundColor: color }]}
      >
        {availability}
      </Badge>
    );
  };

  // Render request status badge
  const renderStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'accepted':
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

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'find' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('find')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'find' && styles.activeTabButtonText,
            ]}
          >
            Find Mentors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'requests' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'requests' && styles.activeTabButtonText,
            ]}
          >
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'find' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />
          }
        >
          {/* Search Bar */}
          <Searchbar
            placeholder="Search mentors or skills"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
          />

          {/* Skills Filter */}
          <Text style={styles.sectionTitle}>Filter by Skills</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.skillsContainer}
            contentContainerStyle={styles.skillsContent}
          >
            {skills.map((skill) => (
              <Chip
                key={skill.id}
                selected={selectedSkills.includes(skill.name)}
                onPress={() => toggleSkill(skill.name)}
                style={styles.skillChip}
                selectedColor={theme.colors.primary}
              >
                {skill.name}
              </Chip>
            ))}
          </ScrollView>

          {/* Mentors List */}
          <Text style={styles.sectionTitle}>Available Mentors</Text>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
          ) : filteredMentors.length === 0 ? (
            <Text style={styles.emptyText}>No mentors found matching your criteria.</Text>
          ) : (
            filteredMentors.map((mentor) => (
              <Card key={mentor.id} style={styles.mentorCard} onPress={() => openMentorDetails(mentor)}>
                <Card.Content>
                  <View style={styles.mentorHeader}>
                    <Avatar.Text
                      size={50}
                      label={mentor.full_name.substring(0, 2).toUpperCase()}
                      style={styles.mentorAvatar}
                    />
                    <View style={styles.mentorInfo}>
                      <Title style={styles.mentorName}>{mentor.full_name}</Title>
                      <Paragraph style={styles.mentorTitle}>
                        {mentor.job_title} • {mentor.department}
                      </Paragraph>
                    </View>
                    {renderAvailabilityBadge(mentor.availability)}
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.mentorStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{mentor.experience}+</Text>
                      <Text style={styles.statLabel}>Years Exp.</Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{mentor.rating}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{mentor.students_helped}</Text>
                      <Text style={styles.statLabel}>Mentees</Text>
                    </View>
                  </View>

                  <View style={styles.skillsRow}>
                    {mentor.skills.slice(0, 3).map((skill, index) => (
                      <Chip key={index} style={styles.mentorSkillChip}>
                        {skill}
                      </Chip>
                    ))}
                    {mentor.skills.length > 3 && (
                      <Chip style={styles.mentorSkillChip}>
                        +{mentor.skills.length - 3}
                      </Chip>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />
          }
        >
          <Text style={styles.sectionTitle}>My Mentorship Requests</Text>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
          ) : requests.length === 0 ? (
            <Text style={styles.emptyText}>You haven't made any mentorship requests yet.</Text>
          ) : (
            requests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <Card.Content>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestTitle}>
                      Request to {request.mentor_name}
                    </Text>
                    {renderStatusBadge(request.status)}
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Skill:</Text>
                      <Text style={styles.detailValue}>{request.skill}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Requested:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(request.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    {request.status === 'accepted' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Accepted:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(request.accepted_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {request.status === 'rejected' && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Rejected:</Text>
                          <Text style={styles.detailValue}>
                            {new Date(request.rejected_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Reason:</Text>
                          <Text style={styles.detailValue}>{request.rejection_reason}</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {request.status === 'accepted' && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        // In a real app, this would navigate to a chat or scheduling screen
                        Alert.alert('Contact Mentor', 'This feature is coming soon!');
                      }}
                      style={styles.actionButton}
                    >
                      Contact Mentor
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Mentor Details Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedMentor && (
            <ScrollView>
              <View style={styles.modalHeader}>
                <Avatar.Text
                  size={80}
                  label={selectedMentor.full_name.substring(0, 2).toUpperCase()}
                  style={styles.modalAvatar}
                />
                <Title style={styles.modalName}>{selectedMentor.full_name}</Title>
                <Paragraph style={styles.modalTitle}>
                  {selectedMentor.job_title} • {selectedMentor.department}
                </Paragraph>
                {renderAvailabilityBadge(selectedMentor.availability)}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedMentor.experience}+</Text>
                  <Text style={styles.modalStatLabel}>Years Experience</Text>
                </View>

                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedMentor.rating}</Text>
                  <Text style={styles.modalStatLabel}>Rating</Text>
                </View>

                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedMentor.students_helped}</Text>
                  <Text style={styles.modalStatLabel}>Mentees Helped</Text>
                </View>
              </View>

              <Text style={styles.modalSectionTitle}>Skills</Text>
              <View style={styles.modalSkillsContainer}>
                {selectedMentor.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    style={styles.modalSkillChip}
                    onPress={() => sendRequest(selectedMentor.id, skill)}
                  >
                    {skill}
                  </Chip>
                ))}
              </View>

              <Text style={styles.modalHelperText}>
                Tap on a skill to request mentorship for that specific skill.
              </Text>

              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                Close
              </Button>
            </ScrollView>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.mutedForeground,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  searchBar: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  skillsContainer: {
    marginBottom: theme.spacing.md,
  },
  skillsContent: {
    paddingBottom: theme.spacing.sm,
  },
  skillChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    marginVertical: theme.spacing.lg,
  },
  mentorCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mentorAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  mentorTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  availabilityBadge: {
    borderRadius: theme.borderRadius.full,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  mentorStats: {
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
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  mentorSkillChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // Semi-transparent purple
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
  },
  requestTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
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
  actionButton: {
    marginTop: theme.spacing.md,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalAvatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  modalName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.md,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
  },
  modalStatLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
  },
  modalSectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  modalSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalSkillChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // Semi-transparent purple
  },
  modalHelperText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  modalCloseButton: {
    marginTop: theme.spacing.md,
  },
});

export default FindMentorScreen;
