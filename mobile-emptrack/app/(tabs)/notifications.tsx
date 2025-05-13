import React from 'react';
import { View, StyleSheet } from 'react-native';
import EmployeeNotificationsScreen from '../../src/screens/employee/EmployeeNotificationsScreen';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <EmployeeNotificationsScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
