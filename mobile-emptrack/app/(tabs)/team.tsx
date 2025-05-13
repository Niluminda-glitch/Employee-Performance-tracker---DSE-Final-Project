import React from 'react';
import { View, StyleSheet } from 'react-native';
import SupervisorTeamScreen from '../../src/screens/supervisor/SupervisorTeamScreen';
import { useRouter } from 'expo-router';

export default function Team() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <SupervisorTeamScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
