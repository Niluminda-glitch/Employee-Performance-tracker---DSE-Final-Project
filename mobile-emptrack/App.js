import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar, Platform } from 'react-native';
import theme from './src/theme/theme';

// Create a custom theme for React Native Paper
const paperTheme = {
  colors: {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    background: theme.colors.background,
    surface: theme.colors.card,
    text: theme.colors.foreground,
    error: theme.colors.destructive,
    disabled: theme.colors.mutedForeground,
    placeholder: theme.colors.mutedForeground,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: theme.colors.primary,
  },
  roundness: theme.borderRadius.md,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"}
        backgroundColor={Platform.OS === 'ios' ? 'transparent' : theme.colors.primary}
        translucent={true}
      />
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
