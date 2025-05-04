import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle, User, Shield } from "lucide-react";

const FirstTimeLoginForm = ({ email, currentPassword, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  const { login } = useAuth();

  // Password validation
  useEffect(() => {
    // Reset match check when either password changes
    const match = newPassword === confirmPassword && newPassword.length > 0;

    // Check password requirements
    const hasLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    // Update password checks
    setPasswordChecks({
      length: hasLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial,
      match: match
    });

    // Calculate password strength (0-100)
    if (newPassword.length === 0) {
      setPasswordStrength(0);
    } else {
      let strength = 0;
      if (hasLength) strength += 20;
      if (hasUppercase) strength += 20;
      if (hasLowercase) strength += 20;
      if (hasNumber) strength += 20;
      if (hasSpecial) strength += 20;
      setPasswordStrength(strength);
    }
  }, [newPassword, confirmPassword]);

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 80) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    // Check if all requirements are met
    const { length, uppercase, lowercase, number, special, match } = passwordChecks;
    if (!length || !uppercase || !lowercase || !number || !special) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!match) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the first-time setup API
      const response = await axios.post('http://localhost:5000/api/auth/first-time-setup', {
        email,
        currentPassword,
        newPassword
      });

      console.log('First-time setup successful:', response.data);

      // Show success message with a more detailed toast
      toast.success('Password changed successfully!', {
        description: 'Your account is now active. You will be redirected to your dashboard.',
        duration: 5000
      });

      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise, log in with the new credentials
        await login(email, newPassword);
      }
    } catch (error) {
      console.error('First-time setup failed:', error);
      setError(error.response?.data?.message || 'Failed to set up your account. Please try again.');
      toast.error('Failed to set up your account', {
        description: error.response?.data?.message || 'Please try again or contact support.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render requirement check item
  const RequirementCheck = ({ fulfilled, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {fulfilled ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300" />
      )}
      <span className={fulfilled ? "text-gray-700" : "text-gray-400"}>
        {text}
      </span>
    </div>
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDBoMTAwdjEwMEgxMDBWMFptLTEwMCAxMDBoMTAwdjEwMEgwVjEwMFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="mt-2 text-white/80">
              Please set a new password to activate your account.
            </p>
          </motion.div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
          <div className="relative">
            <div className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <Input
              id="email"
              value={email}
              disabled
              className="pl-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 bg-gray-50"
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
          <div className="relative">
            <div className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="pl-10 pr-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              required
              aria-describedby="password-requirements"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-6 w-6 rounded-full hover:bg-purple-50 flex items-center justify-center text-muted-foreground hover:text-purple-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ?
                <EyeOff className="h-3.5 w-3.5" /> :
                <Eye className="h-3.5 w-3.5" />
              }
            </button>
          </div>

          {/* Password strength meter */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Password Strength:</span>
                <span className={
                  passwordStrength < 40 ? "text-red-500" :
                  passwordStrength < 80 ? "text-yellow-500" :
                  "text-green-500"
                }>
                  {getStrengthText()}
                </span>
              </div>
              <Progress
                value={passwordStrength}
                className="h-2"
                indicatorClassName={getStrengthColor()}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
          <div className="relative">
            <div className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="pl-10 pr-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 h-6 w-6 rounded-full hover:bg-purple-50 flex items-center justify-center text-muted-foreground hover:text-purple-600 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ?
                <EyeOff className="h-3.5 w-3.5" /> :
                <Eye className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-xl border border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-purple-500" />
            Password Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2" id="password-requirements">
            <RequirementCheck fulfilled={passwordChecks.length} text="At least 8 characters" />
            <RequirementCheck fulfilled={passwordChecks.uppercase} text="At least 1 uppercase letter" />
            <RequirementCheck fulfilled={passwordChecks.lowercase} text="At least 1 lowercase letter" />
            <RequirementCheck fulfilled={passwordChecks.number} text="At least 1 number" />
            <RequirementCheck fulfilled={passwordChecks.special} text="At least 1 special character" />
            <RequirementCheck fulfilled={passwordChecks.match} text="Passwords match" />
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading}
            variant="gradient"
          >
            {isLoading ? 'Setting up...' : 'Set New Password & Activate Account'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default FirstTimeLoginForm;
