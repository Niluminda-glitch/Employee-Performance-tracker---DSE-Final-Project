import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockTasks, mockUsers, mockNotifications, mockDepartments, mockTeamMembers } from './mockData';

// Base URL for API requests (not used in mock mode)
const BASE_URL = 'http://localhost:5000/api';

// Flag to use mock data instead of real API
const USE_MOCK_DATA = true;

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user data on unauthorized
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to redirect to login screen here
      // This will be handled by the AuthContext
    }
    return Promise.reject(error);
  }
);

// Helper function to simulate API delay
const mockDelay = async (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Auth API calls
export const authAPI = {
  // Login user
  login: async (email, password) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // This is handled in AuthContext.js with mock implementation
      throw new Error('Use the mock implementation in AuthContext.js');
    } else {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // This is handled in AuthContext.js with mock implementation
      throw new Error('Use the mock implementation in AuthContext.js');
    } else {
      try {
        const response = await api.get('/users/me');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // This is handled in AuthContext.js with mock implementation
      throw new Error('Use the mock implementation in AuthContext.js');
    } else {
      try {
        const response = await api.put('/users/profile', userData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },
};

// User API calls
export const userAPI = {
  // Get all users (for managers/supervisors)
  getAllUsers: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockUsers;
    } else {
      try {
        const response = await api.get('/users');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockUsers.filter(user => user.role === role);
    } else {
      try {
        const response = await api.get(`/users/role/${role}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const user = mockUsers.find(user => user.id === userId);
      if (user) {
        return user;
      }
      throw { message: 'User not found' };
    } else {
      try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get team members (for supervisors)
  getTeamMembers: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockTeamMembers;
    } else {
      try {
        const response = await api.get('/users/team');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get departments
  getDepartments: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockDepartments;
    } else {
      try {
        const response = await api.get('/departments');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },
};

// Task API calls
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockTasks;
    } else {
      try {
        const response = await api.get('/tasks');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const task = mockTasks.find(task => task.id === taskId);
      if (task) {
        return task;
      }
      throw { message: 'Task not found' };
    } else {
      try {
        const response = await api.get(`/tasks/${taskId}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Get tasks by user
  getTasksByUser: async (userId) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockTasks;
    } else {
      try {
        const response = await api.get(`/tasks/user/${userId}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },
};

// Notification API calls
export const notificationAPI = {
  // Get all notifications for current user
  getNotifications: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockNotifications;
    } else {
      try {
        const response = await api.get('/notifications');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },

  // Create a new notification
  createNotification: async (notificationData) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return {
        id: Date.now(),
        ...notificationData,
        created_at: new Date().toISOString(),
        read: false,
      };
    } else {
      try {
        const response = await api.post('/notifications', notificationData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : { message: 'Network error' };
      }
    }
  },
};

export default api;
