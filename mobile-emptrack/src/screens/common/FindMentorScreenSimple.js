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
import { Card, Title, Paragraph, Searchbar, Chip, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

// Simple theme constants to avoid nested properties
const COLORS = {
  primary: '#7c3aed',
  background: '#f8f9ff',
  foreground: '#0f172a',
  card: '#ffffff',
  mutedForeground: '#64748b',
  secondary: '#f1f5f9',
  accent: '#f0f4ff',
  destructive: '#ef4444',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

const FindMentorScreenSimple = ({ navigation }) => {
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
              selectedColor={COLORS.primary}
            >
              {skill.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Mentors List */}
      {loading && !refreshing ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
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
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.card,
  },
  skillsContainer: {
    marginBottom: SPACING.lg,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  skillsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.foreground,
  },
  clearText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  skillsScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  skillChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  mentorCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  mentorAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  mentorRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  },
  departmentBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  departmentText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  mentorBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.foreground,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: COLORS.primary,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  errorText: {
    color: COLORS.destructive,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  emptyText: {
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
});

export default FindMentorScreenSimple;
