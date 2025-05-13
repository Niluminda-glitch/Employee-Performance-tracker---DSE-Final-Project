import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { USER_ROLES } from '../../src/context/AuthContext';
import { Redirect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../src/theme/theme';
import { Platform, ActivityIndicator, View } from 'react-native';

// Import UI components from the template
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  // If not authenticated, redirect to auth screen
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Determine which tabs to show based on user role
  const userRole = user?.role || USER_ROLES.EMPLOYEE;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        headerShown: false,
        tabBarButton: props => <HapticTab {...props} />,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            paddingBottom: 10, // Add padding to avoid overlap with home indicator
          },
          default: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        }),
      }}
    >
      {/* Common Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
          ),
        }}
      />

      {/* Tasks Tab */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list" size={24} color={color} />
          ),
        }}
      />

      {/* Analytics Tab */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
          ),
        }}
      />

      {/* Leave Request Tab */}
      <Tabs.Screen
        name="leave-request"
        options={{
          title: 'Leave',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-clock" size={24} color={color} />
          ),
        }}
      />

      {/* Find Mentor Tab */}
      <Tabs.Screen
        name="find-mentor"
        options={{
          title: 'Mentors',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-supervisor" size={24} color={color} />
          ),
        }}
      />

      {/* Conditional Tabs based on user role */}
      {userRole === USER_ROLES.MANAGER && (
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-group" size={24} color={color} />
            ),
          }}
        />
      )}

      {userRole === USER_ROLES.SUPERVISOR && (
        <Tabs.Screen
          name="team"
          options={{
            title: 'Team',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-group" size={24} color={color} />
            ),
          }}
        />
      )}

      {userRole === USER_ROLES.EMPLOYEE && (
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="bell" size={24} color={color} />
            ),
          }}
        />
      )}

      {/* Common Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
