import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { USER_ROLES } from '../../src/context/AuthContext';
import EmployeeDashboardScreen from '../../src/screens/employee/EmployeeDashboardScreen';
import ManagerDashboardScreen from '../../src/screens/manager/ManagerDashboardScreen';
import SupervisorDashboardScreen from '../../src/screens/supervisor/SupervisorDashboardScreen';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Determine which dashboard to show based on user role
  const userRole = user?.role || USER_ROLES.EMPLOYEE;

  return (
    <View style={styles.container}>
      {userRole === USER_ROLES.MANAGER && (
        <ManagerDashboardScreen navigation={router} />
      )}

      {userRole === USER_ROLES.SUPERVISOR && (
        <SupervisorDashboardScreen navigation={router} />
      )}

      {userRole === USER_ROLES.EMPLOYEE && (
        <EmployeeDashboardScreen navigation={router} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
