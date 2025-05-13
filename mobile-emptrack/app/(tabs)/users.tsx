import React from 'react';
import { View, StyleSheet } from 'react-native';
import ManagerUsersScreen from '../../src/screens/manager/ManagerUsersScreen';
import { useRouter } from 'expo-router';

export default function Users() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ManagerUsersScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
