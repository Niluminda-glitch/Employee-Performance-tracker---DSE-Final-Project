import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
  session: Session | null;
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
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user profile data from public.users table
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    console.log("[AuthContext] fetchUserProfile: Fetching profile for user ID:", userId);

    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("[AuthContext] Profile fetch error:", profileError);

        // If the error is "No rows found", it might be that the user record hasn't been created yet
        if (profileError.code === 'PGRST116') {
          console.log("[AuthContext] No user profile found, might be a new user");
          return null;
        }

        throw profileError;
      }

      console.log("[AuthContext] fetchUserProfile: Profile data fetched:", data);
      return data as UserData;
    } catch (err: any) {
      console.error("[AuthContext] Error fetching user profile:", err.message);
      setError("Could not load user profile.");
      return null;
    }
  };

  // === Setup Auth State Listener ===
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("[AuthContext] Setting up onAuthStateChange listener.");

    // 1. Check initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      try {
        if (initialSession) {
          console.log("[AuthContext] Initial session found for:", initialSession.user.email);
        } else {
          console.log("[AuthContext] No initial session found");
        }

        setSession(initialSession); // Store session (or null)

        let profile = null;
        if (initialSession?.user) {
          profile = await fetchUserProfile(initialSession.user.id); // Fetch profile if session exists

          // If no profile exists but we have a session, try to create one
          if (!profile) {
            console.log("[AuthContext] No profile found for authenticated user, attempting to create one");
            try {
              const { data: newUserData, error } = await supabase.from("users").insert([
                {
                  id: initialSession.user.id,
                  full_name: initialSession.user.user_metadata?.full_name || initialSession.user.email?.split('@')[0] || 'User',
                  email: initialSession.user.email,
                  role: initialSession.user.user_metadata?.role || 'employee', // Use role from metadata or default to employee
                  status: 'active',
                }
              ]).select().single();

              if (error) {
                console.error("[AuthContext] Error creating user record:", error);
              } else {
                console.log("[AuthContext] Created user record for authenticated user");
                profile = newUserData;
              }
            } catch (err) {
              console.error("[AuthContext] Error in user creation:", err);
            }
          }
        }

        setUser(profile); // Store profile (or null)
        setIsFirstLogin(profile?.status === 'first_login' || false);
      } catch (err) {
        console.error("[AuthContext] Error processing initial session:", err);
        setError("Error initializing authentication. Please try again.");
      } finally {
        setIsLoading(false); // Finished initial load
      }
    }).catch(err => {
      console.error("[AuthContext] Error in initial getSession:", err);
      setError("Failed to get session. Please try again.");
      setIsLoading(false);
    });

    // 2. Listen for auth changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          // Only log significant events
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
            console.log(`[AuthContext] Auth event: ${event}`,
              newSession ? `for ${newSession.user.email}` : "No session");
          }

          // Update session state
          setSession(newSession);

          // If session exists (login/refresh), fetch/update profile
          let profile = null;
          if (newSession?.user) {
            profile = await fetchUserProfile(newSession.user.id);

            // If no profile exists, create one (for any provider, not just Google)
            if (!profile) {
              try {
                console.log("[AuthContext] Creating new user profile after auth event");

                // Determine role from metadata or default to employee
                const role = newSession.user.user_metadata?.role || 'employee';
                console.log("[AuthContext] Using role from metadata:", role);

                const { data: newUserData, error } = await supabase.from("users").insert([
                  {
                    id: newSession.user.id,
                    full_name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'User',
                    email: newSession.user.email,
                    role: role,
                    status: 'active',
                  }
                ]).select().single();

                if (error) {
                  console.error("[AuthContext] Error creating user record:", error);
                } else {
                  console.log("[AuthContext] Created user record successfully:", newUserData);
                  profile = newUserData;
                }
              } catch (err) {
                console.error("[AuthContext] Error in user creation:", err);
              }
            }
          }

          setUser(profile);
          setIsFirstLogin(profile?.status === 'first_login' || false);

          // Clear error on successful auth change
          if (event === 'SIGNED_IN') setError(null);
        } catch (err) {
          console.error("[AuthContext] Error in auth state change handler:", err);
          setError("Authentication error. Please try again.");
        } finally {
          // Always ensure loading is set to false
          setIsLoading(false);
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // === Auth Actions ===
  const login = async (email: string, password: string) => {
    console.log(`[AuthContext] login: Attempting Supabase password login for ${email}`);
    setError(null);
    setIsLoading(true); // Indicate loading during login attempt
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (loginError) throw loginError;
      // onAuthStateChange listener will handle setting session and fetching profile
      console.log("[AuthContext] login: Supabase signInWithPassword successful. Listener will update state.");
      return true;
    } catch (err: any) {
      console.error("[AuthContext] login: Supabase signInWithPassword failed:", err.message);
      setError(err.message || "Login failed. Please check credentials.");
      setUser(null); // Clear profile on failed login
      setSession(null); // Clear session on failed login
      setIsLoading(false); // Ensure loading stops on error
      return false;
    }
  };

  const googleLogin = async () => {
    console.log("[AuthContext] googleLogin: Attempting Supabase Google OAuth login.");
    setError(null);
    setIsLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (oauthError) throw oauthError;
      // Supabase handles the redirect flow. The onAuthStateChange listener
      // will pick up the session when the user returns.
      console.log("[AuthContext] googleLogin: Redirecting to Google...");
      return true;
    } catch (err: any) {
      console.error("[AuthContext] googleLogin: Supabase signInWithOAuth failed:", err.message);
      setError(err.message || "Google login failed.");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log("[AuthContext] logout: Calling Supabase signOut...");
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("[AuthContext] logout: Supabase signOut error:", signOutError.message);
      setError("Logout failed: " + signOutError.message);
    }
    // onAuthStateChange listener will handle setting session/profile to null
    console.log("[AuthContext] logout: Supabase signOut called. Listener will update state.");
  };

  // Reset password
  const resetPassword = async (email: string) => {
    console.log("[AuthContext] resetPassword: Sending reset email to:", email);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });

      if (error) throw error;
      console.log("[AuthContext] resetPassword: Reset email sent successfully");
      return true;
    } catch (err: any) {
      console.error("[AuthContext] resetPassword: Failed to send reset email:", err.message);
      setError(err.message || "Failed to send password reset email");
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserData>) => {
    console.log("[AuthContext] updateProfile: Updating user profile");
    setError(null);

    if (!session?.user || !user) {
      const errorMsg = "You must be logged in to update your profile";
      console.error("[AuthContext] updateProfile:", errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Update user metadata if name is provided
      if (data.full_name !== undefined) {
        console.log("[AuthContext] updateProfile: Updating auth user metadata");
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: data.full_name }
        });

        if (authError) throw authError;
      }

      // Update user data in the database
      console.log("[AuthContext] updateProfile: Updating user record in database");
      const { error: dbError } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (dbError) throw dbError;

      // Refresh user data
      console.log("[AuthContext] updateProfile: Refreshing user profile data");
      const updatedProfile = await fetchUserProfile(session.user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
        console.log("[AuthContext] updateProfile: Profile updated successfully");
      }
      return true;
    } catch (err: any) {
      console.error("[AuthContext] updateProfile: Failed to update profile:", err.message);
      setError(err.message || "Failed to update profile");
      return false;
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    if (session?.user?.id) {
      console.log("[AuthContext] Manually refreshing user data");
      setIsLoading(true);
      try {
        const refreshedProfile = await fetchUserProfile(session.user.id);
        setUser(refreshedProfile);
        setIsFirstLogin(refreshedProfile?.status === 'first_login' || false);
        console.log("[AuthContext] User data refreshed:", refreshedProfile);
      } catch (err) {
        console.error("[AuthContext] Error refreshing user data:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Value provided by the context
  const value = {
    session,
    user,
    login,
    googleLogin,
    logout,
    resetPassword,
    updateProfile,
    refreshUserData,
    isLoading,
    isAuthenticated: !!session?.user,
    isFirstLogin,
    error,
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

// Define the props interface for the ProtectedRoute component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: UserRole;
}

// Protected route component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const { session, user, isLoading, isFirstLogin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
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

    return <Navigate to="/auth" replace />;
  }

  return <>{element}</>;
};
