import React from 'react';
import { View, StyleSheet } from 'react-native';
import FindMentorScreen from '../../src/screens/common/FindMentorScreenSimple';
import { useRouter } from 'expo-router';

export default function FindMentor() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FindMentorScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
