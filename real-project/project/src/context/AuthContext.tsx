
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { getDashboardPathForRole } from '@/lib/auth';

// Define user types
export type UserStatus = 'active' | 'inactive' | 'first_login';
export type UserRole = 'manager' | 'supervisor' | 'employee';

export interface UserData {
  id: string; // This is the auth user id
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  department_id?: string | null;
  supervisor_id?: string | null;
  created_at: string;
  updated_at: string;
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
  api: any; // Axios instance with auth token
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a stable axios instance outside the component
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
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

console.log("[AuthContext] Axios 'api' instance created.");

// Set auth token in axios headers
const setAuthToken = (token: string | null) => {
  if (token) {
    console.log("[AuthContext] Setting auth token header:", token ? 'Token present' : 'Token removed');
    api.defaults.headers.common['x-auth-token'] = token; // Set on the single 'api' instance
    localStorage.setItem('token', token);
  } else {
    console.log("[AuthContext] Removing auth token header");
    delete api.defaults.headers.common['x-auth-token']; // Delete from the single 'api' instance
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the API with the token if it exists
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Load user data on mount or when token changes
  const loadUser = useCallback(async () => {
    console.log(`[AuthContext] loadUser effect running. Current token: ${token ? 'Exists' : 'None'}`);
    if (token) {
      setAuthToken(token); // Ensure header is set with the current token state
      setIsLoading(true); // Set loading true while checking
      setError(null);
      try {
        console.log("[AuthContext] loadUser: Calling GET /users/me");
        const res = await api.get('/users/me'); // Use the single 'api' instance

        if (!res.data || !res.data.id || !res.data.role) {
          throw new Error("Invalid user data from /users/me");
        }
        console.log("[AuthContext] loadUser: User loaded successfully:", res.data);
        localStorage.setItem('user', JSON.stringify(res.data)); // Store profile
        setUser(res.data); // Update user state
        setIsFirstLogin(res.data.status === 'first_login');

      } catch (err: any) {
        console.error("[AuthContext] loadUser: Failed.", err.response?.data || err.message);
        // Only clear token/user if error indicates invalid token (e.g., 401)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setAuthToken(null); // Remove invalid token
          setToken(null);     // Clear token state
          setUser(null);      // Clear user state
        } else {
          setError("Failed to verify session."); // Keep token for potential retry? Or clear anyway? Let's clear.
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false); // Done loading
      }
    } else {
      // No token, ensure we are not loading and user is null
      setAuthToken(null); // Ensure headers/LS are clear
      setUser(null);
      setIsLoading(false);
    }
  }, [token]); // Depend only on the token state

  // Run loadUser when the component mounts or the token state changes
  useEffect(() => {
    loadUser();
  }, [loadUser]); // Now only depends on loadUser (which depends on token)

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    console.log(`[AuthContext] login: Attempting login for ${email}`);
    setIsLoading(true);
    setError(null);
    try {
      // Use plain axios for public login route
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      if (!receivedToken || !receivedUser || !receivedUser.role) {
        throw new Error("Invalid response data from login API");
      }

      console.log("[AuthContext] login: API Success. User:", receivedUser);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      // Update token STATE, which triggers the loadUser effect
      setAuthToken(receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setIsFirstLogin(receivedUser.status === 'first_login');

      toast.success(`Welcome back, ${receivedUser.full_name || receivedUser.email}!`);
      return true;

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed.";
      console.error("[AuthContext] login: API Failed.", errorMsg);

      // Special handling for first-time login
      if (err.response?.status === 403 && err.response?.data?.message === 'Account requires initial setup/password change.') {
        console.log("[AuthContext] login: First-time login detected");
        // Store the credentials temporarily for the first-time login form
        localStorage.setItem('temp_credentials', JSON.stringify({
          email,
          password,
          isFirstTimeLogin: true
        }));
        setIsFirstLogin(true);
        setError(errorMsg);
        return false;
      }

      setAuthToken(null); // Ensure cleanup
      setToken(null);     // Ensure state cleanup
      setUser(null);
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false); // Need to stop loading on error here
    }
  }, []); // No dependencies needed for login action itself

  // First-time setup function
  const firstTimeSetup = useCallback(async (email: string, currentPassword: string, newPassword: string) => {
    console.log(`[AuthContext] firstTimeSetup: Setting up first-time login for ${email}`);
    setIsLoading(true);
    setError(null);
    try {
      // Call the first-time setup API
      const res = await axios.post('http://localhost:5000/api/auth/first-time-setup', {
        email,
        currentPassword,
        newPassword
      });

      const { token: receivedToken, user: receivedUser } = res.data;

      if (!receivedToken || !receivedUser || !receivedUser.role) {
        throw new Error("Invalid response data from first-time setup API");
      }

      console.log("[AuthContext] firstTimeSetup: API Success. User:", receivedUser);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      // Clear temporary credentials
      localStorage.removeItem('temp_credentials');

      // Update token STATE, which triggers the loadUser effect
      setAuthToken(receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setIsFirstLogin(false); // User is no longer in first-time login state

      toast.success(`Welcome, ${receivedUser.full_name || receivedUser.email}!`);
      return true;

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "First-time setup failed.";
      console.error("[AuthContext] firstTimeSetup: API Failed.", errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for firstTimeSetup action itself

  // Logout function
  const logout = useCallback(async () => {
    console.log("[AuthContext] logout: Logging out user.");
    setAuthToken(null); // Clears token from LS and Axios header, clears user from LS
    setError(null);

    // Update token STATE to null, which triggers loadUser effect to clear user state
    setToken(null);
    setUser(null);

    console.log("[AuthContext] logout: Token state set to null.");
    toast.info('You have been logged out');
  }, []); // No dependencies needed

  // Update profile function
  const updateProfile = useCallback(async (data: Partial<UserData>) => {
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

      // Update localStorage with the updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);
      console.log('[AuthContext] Profile updated successfully:', updatedUser);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('[AuthContext] Update profile failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  }, [token, user]);

  // Refresh user data function
  const refreshUserData = useCallback(async () => {
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

      // Update localStorage with the refreshed user data
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsFirstLogin(userData.status === 'first_login');
      console.log('[AuthContext] User data refreshed:', userData);
    } catch (err: any) {
      console.error('[AuthContext] Refresh user data failed:', err.response?.data || err.message);
      setError('Failed to refresh user data.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Wrap googleLogin in useCallback
  const googleLoginCallback = useCallback(async () => {
    console.log('[AuthContext] googleLogin: Attempting Google login');
    setError(null);
    setIsLoading(true);

    try {
      // Redirect to Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[AuthContext] Google login failed:', error.message);
      setError('Google login failed. Please try again.');
      toast.error('Google login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Wrap resetPassword in useCallback
  const resetPasswordCallback = useCallback(async (email: string) => {
    console.log('[AuthContext] resetPassword: Sending reset email to:', email);
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      console.error('[AuthContext] Reset password failed:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to send password reset email.');
      toast.error(error.response?.data?.message || 'Failed to send password reset email.');
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    googleLogin: googleLoginCallback,
    logout,
    resetPassword: resetPasswordCallback,
    updateProfile,
    refreshUserData,
    firstTimeSetup,
    isLoading,
    isAuthenticated: !!token,
    isFirstLogin,
    error,
    setError,
    api // Pass the single, stable 'api' instance
  }), [
    user,
    login,
    googleLoginCallback,
    logout,
    resetPasswordCallback,
    updateProfile,
    refreshUserData,
    firstTimeSetup,
    isLoading,
    token,
    isFirstLogin,
    error
  ]); // Dependencies for memoization

  console.log("[AuthContext] Rendering Provider. State:", {
    isAuthenticated: value.isAuthenticated,
    user: user?.id,
    isLoading
  });

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
  requiredRole?: UserRole | UserRole[];
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
  }, [isLoading, localLoading]);

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
  if (requiredRole) {
    // Check if user has a valid role
    if (!user?.role) {
      toast.error("You don't have permission to access this page");
      return <Navigate to="/auth" replace />;
    }

    // If requiredRole is an array, check if user's role is in the array
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(user.role)) {
        toast.error("You don't have permission to access this page");

        // Redirect to the appropriate dashboard based on role
        if (user.role === 'employee') {
          return <Navigate to="/employee-dashboard" replace />;
        } else if (user.role === 'supervisor') {
          return <Navigate to="/supervisor-dashboard" replace />;
        } else if (user.role === 'manager') {
          return <Navigate to="/manager-dashboard" replace />;
        }

        // If we can't determine the role, just go to auth
        return <Navigate to="/auth" replace />;
      }
    }
    // If requiredRole is a single role, check if user's role matches
    else if (user.role !== requiredRole) {
      toast.error("You don't have permission to access this page");

      // Redirect to the appropriate dashboard based on role
      if (user.role === 'employee') {
        return <Navigate to="/employee-dashboard" replace />;
      } else if (user.role === 'supervisor') {
        return <Navigate to="/supervisor-dashboard" replace />;
      } else if (user.role === 'manager') {
        return <Navigate to="/manager-dashboard" replace />;
      }

      // If we can't determine the role, just go to auth
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{element}</>;
};
