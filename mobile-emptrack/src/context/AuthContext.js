import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/api';

// Define user types
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FIRST_LOGIN: 'first_login',
};

// Create the auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load token and user from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Clear any stored tokens and user data to always start at login screen
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');

        setToken(null);
        setUser(null);
        setIsFirstLogin(false);
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Mock load user data using token
  const loadUser = useCallback(async (currentToken) => {
    if (!currentToken && !token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to get user from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsFirstLogin(userData.status === USER_STATUS.FIRST_LOGIN);
      } else {
        // If no user in storage, create a mock user
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          full_name: 'Test User',
          role: USER_ROLES.EMPLOYEE,
          status: USER_STATUS.ACTIVE,
          job_title: 'Employee',
          avatar_url: null
        };

        setUser(mockUser);
        setIsFirstLogin(false);

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      // If we get an error, clear the token
      await AsyncStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Mock login function for testing
  const login = async (email, password) => {
    console.log(`[AuthContext] login: Mock login for ${email}`);
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle specific dummy login credentials
      if (email === 'employee@example.com' && password === 'password123') {
        const mockToken = 'mock-jwt-token-employee';
        const mockUser = {
          id: 'emp123',
          email: 'employee@example.com',
          full_name: 'Demo Employee',
          role: USER_ROLES.EMPLOYEE,
          status: USER_STATUS.ACTIVE,
          job_title: 'Software Developer',
          department_id: '1',
          supervisor_id: '3',
          avatar_url: null
        };

        // Store token and user data
        await AsyncStorage.setItem('token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));

        // Update state
        setToken(mockToken);
        setUser(mockUser);
        setIsFirstLogin(false);
        setIsAuthenticated(true);

        return true;
      }
      else if (email === 'supervisor@example.com' && password === 'password123') {
        const mockToken = 'mock-jwt-token-supervisor';
        const mockUser = {
          id: 'sup123',
          email: 'supervisor@example.com',
          full_name: 'Demo Supervisor',
          role: USER_ROLES.SUPERVISOR,
          status: USER_STATUS.ACTIVE,
          job_title: 'Team Lead',
          department_id: '1',
          supervisor_id: null,
          avatar_url: null
        };

        // Store token and user data
        await AsyncStorage.setItem('token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));

        // Update state
        setToken(mockToken);
        setUser(mockUser);
        setIsFirstLogin(false);
        setIsAuthenticated(true);

        return true;
      }
      else if (email === 'manager@example.com' && password === 'password123') {
        const mockToken = 'mock-jwt-token-manager';
        const mockUser = {
          id: 'man123',
          email: 'manager@example.com',
          full_name: 'Demo Manager',
          role: USER_ROLES.MANAGER,
          status: USER_STATUS.ACTIVE,
          job_title: 'Department Head',
          department_id: '1',
          supervisor_id: null,
          avatar_url: null
        };

        // Store token and user data
        await AsyncStorage.setItem('token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));

        // Update state
        setToken(mockToken);
        setUser(mockUser);
        setIsFirstLogin(false);
        setIsAuthenticated(true);

        return true;
      }
      else {
        // Handle other email/password combinations
        // Mock user data based on email
        let role = USER_ROLES.EMPLOYEE;
        if (email.includes('manager')) {
          role = USER_ROLES.MANAGER;
        } else if (email.includes('supervisor')) {
          role = USER_ROLES.SUPERVISOR;
        }

        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          full_name: email.split('@')[0].replace(/[.]/g, ' '),
          role: role,
          status: USER_STATUS.ACTIVE,
          job_title: role === USER_ROLES.MANAGER ? 'Department Manager' :
                    role === USER_ROLES.SUPERVISOR ? 'Team Supervisor' : 'Employee',
          avatar_url: null
        };

        // Store token and user data
        await AsyncStorage.setItem('token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));

        // Update state
        setToken(mockToken);
        setUser(mockUser);
        setIsFirstLogin(false);
        setIsAuthenticated(true);

        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // Reset state
      setToken(null);
      setUser(null);
      setIsFirstLogin(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Mock update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get current user data
      const currentUserStr = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(currentUserStr);

      // Update user data with new values
      const updatedUser = {
        ...currentUser,
        ...userData
      };

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      setError('Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isFirstLogin,
    error,
    login,
    logout,
    updateProfile,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
