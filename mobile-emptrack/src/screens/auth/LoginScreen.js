import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { TextInput, Button, ActivityIndicator, Card, Divider, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [showDummyLogins, setShowDummyLogins] = useState(false);
  const { login, isLoading, error, setError, isAuthenticated } = useAuth();

  // Dummy login credentials
  const dummyCredentials = [
    { role: 'Employee', email: 'employee@example.com', password: 'password123' },
    { role: 'Supervisor', email: 'supervisor@example.com', password: 'password123' },
    { role: 'Manager', email: 'manager@example.com', password: 'password123' },
  ];

  // Clear any errors when component mounts
  useEffect(() => {
    setError(null);
  }, [setError]);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const success = await login(email, password);
      if (!success && error) {
        Alert.alert('Login Failed', error);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  // Handle dummy login
  const handleDummyLogin = async (dummyEmail, dummyPassword) => {
    setEmail(dummyEmail);
    setPassword(dummyPassword);

    try {
      const success = await login(dummyEmail, dummyPassword);
      if (!success && error) {
        Alert.alert('Login Failed', error);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Toggle dummy logins visibility
  const toggleDummyLogins = () => {
    setShowDummyLogins(!showDummyLogins);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>EmpTrack</Text>
          <Text style={styles.appTagline}>Employee Performance Tracker</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureEntry}
                color={theme.colors.muted}
              />
            }
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => Alert.alert('Reset Password', 'This feature is coming soon!')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primaryForeground} />
            ) : (
              'Sign In'
            )}
          </Button>

          <TouchableOpacity
            style={styles.dummyLoginToggle}
            onPress={toggleDummyLogins}
          >
            <Text style={styles.dummyLoginToggleText}>
              {showDummyLogins ? 'Hide Demo Logins' : 'Show Demo Logins'}
            </Text>
          </TouchableOpacity>

          {showDummyLogins && (
            <Card style={styles.dummyLoginCard}>
              <Card.Title title="Demo Logins" />
              <Card.Content>
                <Text style={styles.dummyLoginText}>
                  Use these credentials to test different user roles:
                </Text>
                <Divider style={styles.divider} />

                {dummyCredentials.map((cred, index) => (
                  <View key={index} style={styles.dummyLoginItem}>
                    <View style={styles.dummyLoginInfo}>
                      <Text style={styles.dummyLoginRole}>{cred.role}</Text>
                      <Text style={styles.dummyLoginEmail}>{cred.email}</Text>
                    </View>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleDummyLogin(cred.email, cred.password)}
                      style={styles.dummyLoginButton}
                    >
                      Login
                    </Button>
                    {index < dummyCredentials.length - 1 && <Divider style={styles.divider} />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },


  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.sm,
  },
  appName: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  appTagline: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.foreground,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  loginButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
  },
  dummyLoginToggle: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  dummyLoginToggleText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
  dummyLoginCard: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dummyLoginText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  dummyLoginItem: {
    marginVertical: theme.spacing.sm,
  },
  dummyLoginInfo: {
    marginBottom: theme.spacing.xs,
  },
  dummyLoginRole: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.foreground,
  },
  dummyLoginEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.mutedForeground,
  },
  dummyLoginButton: {
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
});

export default LoginScreen;
