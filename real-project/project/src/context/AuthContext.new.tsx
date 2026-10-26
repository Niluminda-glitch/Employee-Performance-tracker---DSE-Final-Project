import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios, { type AxiosInstance } from 'axios';
import { getDashboardPathForRole } from '@/lib/auth';

// Define user types
export type UserStatus = 'active' | 'inactive' | 'first_login';
export type UserRole = 'manager' | 'supervisor' | 'employee';

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  department_id?: string | null;
  supervisor_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  api: AxiosInstance; // Axios instance with auth token
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Create axios instance
const createAuthAxios = (token: string | null) => {
  const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Update with your backend URL
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests if available
  if (token) {
    instance.defaults.headers.common['x-auth-token'] = token;
  }

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response && error.response.status === 401) {
        // Clear token and user data
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Set auth token in axios headers
const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState(createAuthAxios(token));

  // Load user data on mount or when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Update the api instance with the new token
        const newApi = createAuthAxios(token);
        setApi(newApi);

        // Fetch user profile
        const response = await newApi.get('/users/me');
        const userData = response.data;

        setUser(userData);
        setIsFirstLogin(userData.status === 'first_login');
        console.log('[AuthContext] User data loaded:', userData);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        console.error('[AuthContext] Error loading user:', error.response?.data || error.message);
        setError('Failed to load user profile. Please log in again.');
        setToken(null);
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    console.log(`[AuthContext] login: Attempting login for ${email}`);
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      // Save token and update state
      setToken(newToken);
      setAuthToken(newToken);
      setUser(userData);
      setIsFirstLogin(userData.status === 'first_login');

      console.log('[AuthContext] Login successful:', userData);
      toast.success(`Welcome back, ${userData.full_name || userData.email}!`);
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('[AuthContext] Login failed:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function
  const googleLogin = async () => {
    console.log('[AuthContext] googleLogin: Attempting Google login');
    setError(null);
    setIsLoading(true);

    try {
      // Redirect to Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('[AuthContext] Google login failed:', error.message);
      setError('Google login failed. Please try again.');
      toast.error('Google login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    console.log('[AuthContext] logout: Logging out user');
    setError(null);

    // Clear token and user data
    setToken(null);
    setAuthToken(null);
    setUser(null);

    toast.info('You have been logged out');
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    console.log('[AuthContext] resetPassword: Sending reset email to:', email);
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('[AuthContext] Reset password failed:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to send password reset email.');
      toast.error(error.response?.data?.message || 'Failed to send password reset email.');
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserData>) => {
    console.log('[AuthContext] updateProfile: Updating user profile');
    setError(null);

    if (!token || !user) {
      const errorMsg = 'You must be logged in to update your profile';
      console.error('[AuthContext] updateProfile:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const response = await api.put(`/users/${user.id}`, data);
      const updatedUser = response.data;

      setUser(updatedUser);
      console.log('[AuthContext] Profile updated successfully:', updatedUser);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('[AuthContext] Update profile failed:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to update profile.');
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  // Refresh user data function
  const refreshUserData = async () => {
    console.log('[AuthContext] refreshUserData: Refreshing user data');
    if (!token) {
      console.log('[AuthContext] refreshUserData: No token, skipping refresh');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/users/me');
      const userData = response.data;

      setUser(userData);
      setIsFirstLogin(userData.status === 'first_login');
      console.log('[AuthContext] User data refreshed:', userData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('[AuthContext] Refresh user data failed:', error.response?.data || error.message);
      setError('Failed to refresh user data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Value provided by the context
  const value = {
    user,
    login,
    googleLogin,
    logout,
    resetPassword,
    updateProfile,
    refreshUserData,
    isLoading,
    isAuthenticated: !!token,
    isFirstLogin,
    error,
    setError,
    api,
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

// Define the props interface for the ProtectedRoute component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: UserRole;
}

// Protected route component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const { user, isLoading, isFirstLogin, isAuthenticated } = useAuth();
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(true);

  // Add a timeout to prevent infinite loading in the protected route
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (localLoading) {
        console.log('[ProtectedRoute] Loading timeout reached, forcing loading state to false');
        setLocalLoading(false);
      }
    }, 3000); // 3 seconds timeout

    // If auth context is done loading, update local loading state
    if (!isLoading) {
      setLocalLoading(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  // Show loading spinner only for a reasonable amount of time
  if (localLoading && isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to first login page if status is first_login
  if (isFirstLogin && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  // Role check if required
  if (requiredRole && (!user?.role || user.role !== requiredRole)) {
    toast.error("You don't have permission to access this page");

    // Redirect to the appropriate dashboard based on role
    if (user?.role === 'employee') {
      return <Navigate to="/employee-dashboard" replace />;
    } else if (user?.role === 'supervisor') {
      return <Navigate to="/supervisor-dashboard" replace />;
    } else if (user?.role === 'manager') {
      return <Navigate to="/manager-dashboard" replace />;
    }

    // If we can't determine the role, just go to auth
    return <Navigate to="/auth" replace />;
  }

  return <>{element}</>;
};
