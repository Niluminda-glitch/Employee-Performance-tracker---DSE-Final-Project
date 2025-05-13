import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnalyticsScreen from '../../src/screens/common/AnalyticsScreen';
import { useRouter } from 'expo-router';

export default function Analytics() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <AnalyticsScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
