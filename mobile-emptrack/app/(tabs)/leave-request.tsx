import React from 'react';
import { View, StyleSheet } from 'react-native';
import LeaveRequestScreen from '../../src/screens/common/LeaveRequestScreen';
import { useRouter } from 'expo-router';

export default function LeaveRequest() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <LeaveRequestScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
