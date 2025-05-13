import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoginScreen from '../src/screens/auth/LoginScreen';

export default function Auth() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // If user is authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <LoginScreen navigation={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
