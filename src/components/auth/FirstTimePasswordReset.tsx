import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Props {
  userId: string;
  onSuccess: (role?: UserRole) => void;
}

const FirstTimePasswordReset: React.FC<Props> = ({ userId, onSuccess }) => {
  const { refreshUserData } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    try {
      console.log("Starting password update process for user:", userId);

      // Update password in Supabase Auth
      const { data: updateData, error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error updating auth password:", error);
        throw error;
      }

      console.log("Auth password updated successfully");

      // Update status in users table
      console.log("Updating user status in database...");
      const { data: dbData, error: dbError } = await supabase
        .from("users")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select();

      if (dbError) {
        console.error("Error updating user status:", dbError);
        throw dbError;
      }

      console.log("User status updated successfully:", dbData);

      // Get user role to determine where to redirect
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        throw userError;
      }

      const userRole = userData.role as UserRole;
      console.log("User role fetched:", userRole);

      toast.success("Password updated successfully!");

      // Refresh user data in the auth context
      await refreshUserData();

      // Force redirect directly to the appropriate dashboard based on role
      console.log("Redirecting to dashboard for role:", userRole);

      // Set a short timeout to allow the toast to be visible
      setTimeout(() => {
        setLoading(false); // Make sure loading is set to false before redirect

        // Directly redirect based on role
        if (userRole === 'employee') {
          window.location.href = window.location.origin + "/employee-dashboard";
        } else if (userRole === 'supervisor') {
          window.location.href = window.location.origin + "/supervisor-dashboard";
        } else if (userRole === 'manager') {
          window.location.href = window.location.origin + "/manager-dashboard";
        } else {
          // Fallback
          window.location.href = window.location.origin + "/auth";
        }
      }, 1000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Set New Password
        </CardTitle>
        <CardDescription className="text-center">
          You need to set a new password before continuing
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters and include uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm text-gray-600">
        This is required for security purposes
      </CardFooter>
    </Card>
  );
};

export default FirstTimePasswordReset;
