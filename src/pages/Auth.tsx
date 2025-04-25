import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import FirstTimePasswordReset from "@/components/auth/FirstTimePasswordReset";
import ResetPassword from "@/components/auth/ResetPassword";
import DebugAuth from "@/components/auth/DebugAuth";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthProps {
  resetMode?: boolean;
}

const Auth = ({ resetMode = false }: AuthProps) => {
  const navigate = useNavigate();
  const { session, user, isLoading, isFirstLogin, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  // Handle redirects based on authentication state
  useEffect(() => {
    // Only attempt redirect if we're not loading and have a session
    if (!isLoading && session?.user) {
      if (user) {
        // Only redirect if we have user data and not in first login state
        if (!isFirstLogin && !resetMode) {
          redirectBasedOnRole(user.role);
        }
      }
    }
  }, [session?.user?.id, user?.role, isLoading, isFirstLogin, resetMode, navigate]);

  const redirectBasedOnRole = (role: string) => {
    // Default to employee dashboard if role is not recognized
    let targetPath = "/employee-dashboard";

    switch (role) {
      case 'manager':
        targetPath = "/manager-dashboard";
        break;
      case 'supervisor':
        targetPath = "/supervisor-dashboard";
        break;
      case 'employee':
        targetPath = "/employee-dashboard";
        break;
      default:
        console.warn("Unrecognized role:", role, "- defaulting to employee dashboard");
    }

    navigate(targetPath);
  };

  if (isLoading || localLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-8"></div>
        <p className="text-purple-700 font-medium mb-8">
          {localLoading ? "Updating your account..." : "Loading..."}
        </p>
        <DebugAuth />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-mesh-gradient">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>
      <div className="w-full max-w-md z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 relative group w-20 h-20">
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient-enhanced mb-2">EmpTrack</h1>
          <p className="text-sm text-purple-600 font-medium">Employee Management System</p>
        </div>

        {/* Render the appropriate component based on mode */}
        {resetMode ? (
          <ResetPassword />
        ) : isFirstLogin && user && session ? (
          <FirstTimePasswordReset
            userId={session.user.id}
            onSuccess={(role) => {
              console.log("Password reset successful, redirecting to dashboard...");
              setLocalLoading(true);
              setError(null);

              // Redirect to the appropriate dashboard based on user role
              setTimeout(() => {
                if (role === 'employee') {
                  window.location.href = window.location.origin + "/employee-dashboard";
                } else if (role === 'supervisor') {
                  window.location.href = window.location.origin + "/supervisor-dashboard";
                } else if (role === 'manager') {
                  window.location.href = window.location.origin + "/manager-dashboard";
                } else {
                  // Default fallback if role is undefined
                  window.location.href = window.location.origin + "/auth";
                }
              }, 1500);
            }}
          />
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
};

export default Auth;
