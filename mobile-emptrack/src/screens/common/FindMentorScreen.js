import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Title, Paragraph, Searchbar, Chip, Button, Avatar, ActivityIndicator, Badge } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

const FindMentorScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Fetch mentors and skills on component mount
  useEffect(() => {
    fetchMentors();
    fetchSkills();
  }, []);

  // Filter mentors when search query or selected skills change
  useEffect(() => {
    filterMentors();
  }, [searchQuery, selectedSkills, mentors]);

  // Mock function to fetch mentors
  const fetchMentors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockMentors = [
        {
          id: '1',
          full_name: 'John Doe',
          job_title: 'Senior Developer',
          department: 'Engineering',
          avatar_url: null,
          skills: [
            { id: '1', name: 'JavaScript', proficiency: 'Expert', willing_to_mentor: true },
            { id: '2', name: 'React', proficiency: 'Expert', willing_to_mentor: true },
            { id: '3', name: 'Node.js', proficiency: 'Advanced', willing_to_mentor: true },
          ],
          bio: 'Full-stack developer with 8 years of experience. Passionate about teaching and mentoring junior developers.',
          availability: 'Weekdays after 2 PM',
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          job_title: 'UX Designer',
          department: 'Design',
          avatar_url: null,
          skills: [
            { id: '4', name: 'UI Design', proficiency: 'Expert', willing_to_mentor: true },
            { id: '5', name: 'Figma', proficiency: 'Expert', willing_to_mentor: true },
            { id: '6', name: 'User Research', proficiency: 'Advanced', willing_to_mentor: true },
          ],
          bio: 'UX designer with a focus on user-centered design. I enjoy helping others improve their design skills.',
          availability: 'Flexible schedule',
        },
        {
          id: '3',
          full_name: 'Robert Johnson',
          job_title: 'Project Manager',
          department: 'Management',
          avatar_url: null,
          skills: [
            { id: '7', name: 'Agile', proficiency: 'Expert', willing_to_mentor: true },
            { id: '8', name: 'Scrum', proficiency: 'Expert', willing_to_mentor: true },
            { id: '9', name: 'Leadership', proficiency: 'Expert', willing_to_mentor: true },
          ],
          bio: 'Certified Scrum Master with experience leading cross-functional teams. Happy to share knowledge on project management.',
          availability: 'Monday and Wednesday mornings',
        },
      ];

      setMentors(mockMentors);
      setFilteredMentors(mockMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock function to fetch available skills
  const fetchSkills = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data
      const mockSkills = [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'React' },
        { id: '3', name: 'Node.js' },
        { id: '4', name: 'UI Design' },
        { id: '5', name: 'Figma' },
        { id: '6', name: 'User Research' },
        { id: '7', name: 'Agile' },
        { id: '8', name: 'Scrum' },
        { id: '9', name: 'Leadership' },
        { id: '10', name: 'Python' },
        { id: '11', name: 'Data Analysis' },
      ];

      setAvailableSkills(mockSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Filter mentors based on search query and selected skills
  const filterMentors = () => {
    if (!mentors.length) return;

    let filtered = [...mentors];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        mentor =>
          mentor.full_name.toLowerCase().includes(query) ||
          mentor.job_title.toLowerCase().includes(query) ||
          mentor.department.toLowerCase().includes(query) ||
          mentor.skills.some(skill => skill.name.toLowerCase().includes(query))
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(mentor =>
        selectedSkills.every(selectedSkill =>
          mentor.skills.some(skill => skill.id === selectedSkill.id)
        )
      );
    }

    setFilteredMentors(filtered);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  // Toggle skill selection
  const toggleSkill = (skill) => {
    if (selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Clear all selected skills
  const clearSkills = () => {
    setSelectedSkills([]);
  };

  // Request mentorship
  const requestMentorship = (mentor) => {
    // In a real app, this would send a request to the backend
    alert(`Mentorship request sent to ${mentor.full_name}!`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />
      }
    >
      <Text style={styles.title}>Find a Mentor</Text>
      <Text style={styles.subtitle}>Connect with experienced colleagues who can help you grow</Text>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search by name, skill, or department"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Skills Filter */}
      <View style={styles.skillsContainer}>
        <View style={styles.skillsHeader}>
          <Text style={styles.skillsTitle}>Filter by Skills</Text>
          {selectedSkills.length > 0 && (
            <TouchableOpacity onPress={clearSkills}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsScroll}>
          {availableSkills.map(skill => (
            <Chip
              key={skill.id}
              selected={selectedSkills.some(s => s.id === skill.id)}
              onPress={() => toggleSkill(skill)}
              style={styles.skillChip}
              selectedColor={theme.colors.primary}
            >
              {skill.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Mentors List */}
      {loading && !refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredMentors.length === 0 ? (
        <Text style={styles.emptyText}>No mentors found matching your criteria.</Text>
      ) : (
        filteredMentors.map(mentor => (
          <Card key={mentor.id} style={styles.mentorCard}>
            <Card.Content>
              <View style={styles.mentorHeader}>
                <Avatar.Text
                  size={60}
                  label={mentor.full_name.substring(0, 2).toUpperCase()}
                  style={styles.mentorAvatar}
                />
                <View style={styles.mentorInfo}>
                  <Title style={styles.mentorName}>{mentor.full_name}</Title>
                  <Paragraph style={styles.mentorRole}>{mentor.job_title}</Paragraph>
                  <View style={styles.departmentBadge}>
                    <Text style={styles.departmentText}>{mentor.department}</Text>
                  </View>
                </View>
              </View>

              <Paragraph style={styles.mentorBio}>{mentor.bio}</Paragraph>

              <View style={styles.skillsSection}>
                <Text style={styles.skillsSectionTitle}>Skills & Expertise</Text>
                <View style={styles.mentorSkills}>
                  {mentor.skills.map(skill => (
                    <Chip
                      key={skill.id}
                      style={styles.mentorSkillChip}
                      textStyle={styles.mentorSkillText}
                    >
                      {skill.name} ({skill.proficiency})
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.availabilitySection}>
                <Text style={styles.availabilityTitle}>Availability</Text>
                <Text style={styles.availabilityText}>{mentor.availability}</Text>
              </View>

              <Button
                mode="contained"
                style={styles.requestButton}
                onPress={() => requestMentorship(mentor)}
              >
                Request Mentorship
              </Button>
            </Card.Content>
          </Card>
        ))
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
  searchBar: {
    marginBottom: theme.spacing.md,
    elevation: 0,
    backgroundColor: theme.colors.card,
  },
  skillsContainer: {
    marginBottom: theme.spacing.lg,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  skillsTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  clearText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  skillsScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  skillChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  mentorCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  mentorAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
  },
  mentorRole: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xs,
  },
  departmentBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  departmentText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.medium,
  },
  mentorBio: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  skillsSection: {
    marginBottom: theme.spacing.md,
  },
  skillsSectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  mentorSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mentorSkillChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
  },
  mentorSkillText: {
    fontSize: theme.fontSizes.xs,
  },
  availabilitySection: {
    marginBottom: theme.spacing.md,
  },
  availabilityTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  availabilityText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  requestButton: {
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

export default FindMentorScreen;
