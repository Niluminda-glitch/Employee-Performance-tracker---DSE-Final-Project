import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { USER_ROLES } from '../../src/context/AuthContext';
import EmployeeProfileScreen from '../../src/screens/employee/EmployeeProfileScreen';
import ManagerProfileScreen from '../../src/screens/manager/ManagerProfileScreen';
import SupervisorProfileScreen from '../../src/screens/supervisor/SupervisorProfileScreen';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Determine which profile screen to show based on user role
  const userRole = user?.role || USER_ROLES.EMPLOYEE;
  
  return (
    <View style={styles.container}>
      {userRole === USER_ROLES.MANAGER && (
        <ManagerProfileScreen navigation={router} />
      )}
      
      {userRole === USER_ROLES.SUPERVISOR && (
        <SupervisorProfileScreen navigation={router} />
      )}
      
      {userRole === USER_ROLES.EMPLOYEE && (
        <EmployeeProfileScreen navigation={router} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
