import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';
import theme from '../src/theme/theme';
import { Platform, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* Add padding to account for status bar on iOS */}
            <View style={{
              flex: 1,
              paddingTop: Platform.OS === 'ios' ? 50 : 0,
              backgroundColor: theme.colors.background
            }}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </View>
            <StatusBar style={Platform.OS === 'ios' ? "dark" : "light"} />
          </ThemeProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
