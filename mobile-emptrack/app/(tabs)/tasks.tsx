import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { USER_ROLES } from '../../src/context/AuthContext';
import EmployeeTasksScreen from '../../src/screens/employee/EmployeeTasksScreen';
import ManagerTasksScreen from '../../src/screens/manager/ManagerTasksScreen';
import SupervisorTasksScreen from '../../src/screens/supervisor/SupervisorTasksScreen';
import { useRouter } from 'expo-router';

export default function Tasks() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Determine which tasks screen to show based on user role
  const userRole = user?.role || USER_ROLES.EMPLOYEE;
  
  return (
    <View style={styles.container}>
      {userRole === USER_ROLES.MANAGER && (
        <ManagerTasksScreen navigation={router} />
      )}
      
      {userRole === USER_ROLES.SUPERVISOR && (
        <SupervisorTasksScreen navigation={router} />
      )}
      
      {userRole === USER_ROLES.EMPLOYEE && (
        <EmployeeTasksScreen navigation={router} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
