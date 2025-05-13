import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Avatar, Button, Card, TextInput, Divider, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

const EmployeeProfileScreen = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [jobTitle, setJobTitle] = useState(user?.job_title || '');
  const [email, setEmail] = useState(user?.email || '');

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const success = await updateProfile({
        full_name: fullName,
        job_title: jobTitle,
        email: email,
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={80}
          label={(user?.full_name || 'U').substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.userRole}>{user?.role || 'Employee'}</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Profile Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {editing ? (
            <View style={styles.editForm}>
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Job Title"
                value={jobTitle}
                onChangeText={setJobTitle}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setEditing(false)}
                  style={[styles.button, styles.cancelButton]}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.primaryForeground} size={16} />
                  ) : (
                    'Save'
                  )}
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.full_name || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Job Title</Text>
                <Text style={styles.infoValue}>{user?.job_title || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{user?.role || 'Employee'}</Text>
              </View>
              
              <Button
                mode="contained"
                onPress={() => setEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Notification Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
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
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  userRole: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.mutedForeground,
    textTransform: 'capitalize',
  },
  divider: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.foreground,
  },
  editButton: {
    marginTop: theme.spacing.md,
  },
  editForm: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    borderColor: theme.colors.muted,
  },
  actionItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.muted,
  },
  actionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.foreground,
  },
  logoutText: {
    color: theme.colors.destructive,
  },
});

export default EmployeeProfileScreen;
