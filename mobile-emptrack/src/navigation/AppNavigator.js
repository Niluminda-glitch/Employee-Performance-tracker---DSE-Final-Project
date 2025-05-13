import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import theme from '../theme/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Employee Screens
import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';
import EmployeeTasksScreen from '../screens/employee/EmployeeTasksScreen';
import EmployeeProfileScreen from '../screens/employee/EmployeeProfileScreen';
import EmployeeNotificationsScreen from '../screens/employee/EmployeeNotificationsScreen';
import ActiveTaskAssistantScreen from '../screens/employee/ActiveTaskAssistantScreen';
import LeaveRequestScreen from '../screens/employee/LeaveRequestScreen';
import FindMentorScreen from '../screens/employee/FindMentorScreen';

// Manager Screens
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import UserManagementScreen from '../screens/manager/UserManagementScreen';
import DepartmentAnalysisScreen from '../screens/manager/DepartmentAnalysisScreen';
import ManagerPerformanceAnalyticsScreen from '../screens/manager/PerformanceAnalyticsScreen';
import ManagerRequestManagementScreen from '../screens/manager/RequestManagementScreen';
import ManagerProfileScreen from '../screens/manager/ManagerProfileScreen';

// Supervisor Screens
import SupervisorDashboardScreen from '../screens/supervisor/SupervisorDashboardScreen';
import TeamManagementScreen from '../screens/supervisor/TeamManagementScreen';
import TaskManagementScreen from '../screens/supervisor/TaskManagementScreen';
import SupervisorRequestManagementScreen from '../screens/supervisor/RequestManagementScreen';
import SupervisorPerformanceAnalyticsScreen from '../screens/supervisor/PerformanceAnalyticsScreen';
import SupervisorTeamScreen from '../screens/supervisor/SupervisorTeamScreen';
import SupervisorTasksScreen from '../screens/supervisor/SupervisorTasksScreen';
import SupervisorProfileScreen from '../screens/supervisor/SupervisorProfileScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Employee Tab Navigator
const EmployeeTabNavigator = () => {
  // Create a stack navigator for each tab
  const DashboardStack = createNativeStackNavigator();
  const TasksStack = createNativeStackNavigator();
  const NotificationsStack = createNativeStackNavigator();
  const ProfileStack = createNativeStackNavigator();

  // Dashboard Stack
  const DashboardStackScreen = () => (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardMain"
        component={EmployeeDashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="ActiveTask"
        component={ActiveTaskAssistantScreen}
        options={{ title: 'Active Task Assistant' }}
      />
      <DashboardStack.Screen
        name="LeaveRequest"
        component={LeaveRequestScreen}
        options={{ title: 'Leave & Overtime' }}
      />
      <DashboardStack.Screen
        name="FindMentor"
        component={FindMentorScreen}
        options={{ title: 'Find a Mentor' }}
      />
    </DashboardStack.Navigator>
  );

  // Tasks Stack
  const TasksStackScreen = () => (
    <TasksStack.Navigator>
      <TasksStack.Screen
        name="TasksMain"
        component={EmployeeTasksScreen}
        options={{ headerShown: false }}
      />
      <TasksStack.Screen
        name="ActiveTask"
        component={ActiveTaskAssistantScreen}
        options={{ title: 'Active Task Assistant' }}
      />
    </TasksStack.Navigator>
  );

  // Notifications Stack
  const NotificationsStackScreen = () => (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen
        name="NotificationsMain"
        component={EmployeeNotificationsScreen}
        options={{ headerShown: false }}
      />
    </NotificationsStack.Navigator>
  );

  // Profile Stack
  const ProfileStackScreen = () => (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={EmployeeProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Tasks') {
            iconName = 'clipboard-list';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else if (route.name === 'Notifications') {
            iconName = 'bell';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.foreground,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.semibold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Tasks" component={TasksStackScreen} />
      <Tab.Screen name="Notifications" component={NotificationsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

// Manager Tab Navigator
const ManagerTabNavigator = () => {
  // Create a stack navigator for each tab
  const DashboardStack = createNativeStackNavigator();
  const UsersStack = createNativeStackNavigator();
  const AnalyticsStack = createNativeStackNavigator();
  const ProfileStack = createNativeStackNavigator();

  // Dashboard Stack
  const DashboardStackScreen = () => (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardMain"
        component={ManagerDashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="Users"
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <DashboardStack.Screen
        name="Departments"
        component={DepartmentAnalysisScreen}
        options={{ title: 'Department Analysis' }}
      />
      <DashboardStack.Screen
        name="Analytics"
        component={ManagerPerformanceAnalyticsScreen}
        options={{ title: 'Performance Analytics' }}
      />
      <DashboardStack.Screen
        name="Requests"
        component={ManagerRequestManagementScreen}
        options={{ title: 'Request Management' }}
      />
    </DashboardStack.Navigator>
  );

  // Users Stack
  const UsersStackScreen = () => (
    <UsersStack.Navigator>
      <UsersStack.Screen
        name="UsersMain"
        component={UserManagementScreen}
        options={{ headerShown: false }}
      />
      <UsersStack.Screen
        name="Departments"
        component={DepartmentAnalysisScreen}
        options={{ title: 'Department Analysis' }}
      />
    </UsersStack.Navigator>
  );

  // Analytics Stack
  const AnalyticsStackScreen = () => (
    <AnalyticsStack.Navigator>
      <AnalyticsStack.Screen
        name="AnalyticsMain"
        component={ManagerPerformanceAnalyticsScreen}
        options={{ headerShown: false }}
      />
      <AnalyticsStack.Screen
        name="Departments"
        component={DepartmentAnalysisScreen}
        options={{ title: 'Department Analysis' }}
      />
    </AnalyticsStack.Navigator>
  );

  // Profile Stack
  const ProfileStackScreen = () => (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ManagerProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Users') {
            iconName = 'account-group';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-bar';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.foreground,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.semibold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Users" component={UsersStackScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

// Supervisor Tab Navigator
const SupervisorTabNavigator = () => {
  // Create a stack navigator for each tab
  const DashboardStack = createNativeStackNavigator();
  const TeamStack = createNativeStackNavigator();
  const TasksStack = createNativeStackNavigator();
  const ProfileStack = createNativeStackNavigator();

  // Dashboard Stack
  const DashboardStackScreen = () => (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardMain"
        component={SupervisorDashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="Team"
        component={TeamManagementScreen}
        options={{ title: 'Team Management' }}
      />
      <DashboardStack.Screen
        name="Tasks"
        component={TaskManagementScreen}
        options={{ title: 'Task Management' }}
      />
      <DashboardStack.Screen
        name="Requests"
        component={SupervisorRequestManagementScreen}
        options={{ title: 'Request Management' }}
      />
      <DashboardStack.Screen
        name="Performance"
        component={SupervisorPerformanceAnalyticsScreen}
        options={{ title: 'Performance Analytics' }}
      />
    </DashboardStack.Navigator>
  );

  // Team Stack
  const TeamStackScreen = () => (
    <TeamStack.Navigator>
      <TeamStack.Screen
        name="TeamMain"
        component={TeamManagementScreen}
        options={{ headerShown: false }}
      />
      <TeamStack.Screen
        name="Performance"
        component={SupervisorPerformanceAnalyticsScreen}
        options={{ title: 'Performance Analytics' }}
      />
    </TeamStack.Navigator>
  );

  // Tasks Stack
  const TasksStackScreen = () => (
    <TasksStack.Navigator>
      <TasksStack.Screen
        name="TasksMain"
        component={TaskManagementScreen}
        options={{ headerShown: false }}
      />
      <TasksStack.Screen
        name="Team"
        component={TeamManagementScreen}
        options={{ title: 'Team Management' }}
      />
    </TasksStack.Navigator>
  );

  // Profile Stack
  const ProfileStackScreen = () => (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={SupervisorProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Team') {
            iconName = 'account-group';
          } else if (route.name === 'Tasks') {
            iconName = 'clipboard-list';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.foreground,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.semibold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Team" component={TeamStackScreen} />
      <Tab.Screen name="Tasks" component={TasksStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  const { user } = useAuth();

  // Determine which dashboard to show based on user role
  let TabNavigator;

  switch (user?.role) {
    case USER_ROLES.MANAGER:
      TabNavigator = ManagerTabNavigator;
      break;
    case USER_ROLES.SUPERVISOR:
      TabNavigator = SupervisorTabNavigator;
      break;
    case USER_ROLES.EMPLOYEE:
    default:
      TabNavigator = EmployeeTabNavigator;
      break;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
};

// App Navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
