import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Mail, Key, User, Users, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('employee'); // Default role is employee
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) { // Basic password length check
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting signup process with role:", role);

      // Attempt to sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // Pass metadata that the trigger function (handle_new_user) can use
          data: {
            full_name: fullName,
            role: role, // Pass the selected role
          },
          // Optional: Specify email redirect path after confirmation
          // emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Check if user was created successfully
      if (data.user) {
        console.log("User created in Auth with ID:", data.user.id);
        console.log("User metadata:", data.user.user_metadata);

        // Explicitly create the user record in the database with the selected role
        const { error: dbError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role, // Explicitly set the role from the form
            status: "first_login",
          },
        ]);

        if (dbError) {
          console.error("Error creating user record:", dbError);
          throw dbError;
        }

        console.log("User record created in database with role:", role);
      }

      // Check if user object exists and needs confirmation
      if (data.user && data.user.identities?.length === 0) {
         // This case might happen with email confirmation OFF in Supabase settings
         // but where Supabase still expects some action? Less common.
         // Or if there was an issue but no specific error thrown.
         toast.info("Signup attempted, please check your email or try logging in.");
      } else if (data.session) {
         // User is created AND logged in (email confirmation likely OFF)
         toast.success("Signup successful! Redirecting...");
         // The AuthProvider listener and middleware will handle redirect/profile fetch
         // Redirect based on role
         if (role === 'employee') {
           navigate('/employee-dashboard');
         } else if (role === 'supervisor') {
           navigate('/supervisor-dashboard');
         } else if (role === 'manager') {
           navigate('/manager-dashboard');
         } else {
           navigate('/employee-dashboard'); // Default fallback
         }
      } else if (data.user) {
        // User is created but requires verification (email confirmation likely ON)
         toast.success("Signup successful! Please check your email to verify your account.");
         // Optionally redirect to a "Check your email" page or back to login
         navigate('/auth?message=check-email');
      } else {
        // Unexpected case
        toast.error("An unexpected issue occurred during signup.");
      }

    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    id="fullName" type="text" placeholder="Your Name"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="pl-9" required disabled={loading}
                />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="pl-9" required disabled={loading}
                />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password (min. 8 characters)</Label>
            <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="password" type="password" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-9" required disabled={loading}
                />
            </div>
          </div>
           <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
             <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="confirmPassword" type="password" placeholder="••••••••"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9" required disabled={loading}
                />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select Your Role</Label>
            <RadioGroup
              value={role}
              onValueChange={setRole}
              className="grid grid-cols-1 gap-2"
            >
              <div className={`flex items-center space-x-2 rounded-md border p-3 ${role === 'employee' ? 'bg-purple-50 border-purple-200' : ''}`}>
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee" className="flex items-center cursor-pointer">
                  <User className="h-4 w-4 mr-2 text-purple-600" />
                  <div>
                    <span className="font-medium">Employee</span>
                    <p className="text-xs text-gray-500">Regular team member</p>
                  </div>
                </Label>
              </div>

              <div className={`flex items-center space-x-2 rounded-md border p-3 ${role === 'supervisor' ? 'bg-blue-50 border-blue-200' : ''}`}>
                <RadioGroupItem value="supervisor" id="supervisor" />
                <Label htmlFor="supervisor" className="flex items-center cursor-pointer">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <div>
                    <span className="font-medium">Supervisor</span>
                    <p className="text-xs text-gray-500">Team leader or supervisor</p>
                  </div>
                </Label>
              </div>

              <div className={`flex items-center space-x-2 rounded-md border p-3 ${role === 'manager' ? 'bg-indigo-50 border-indigo-200' : ''}`}>
                <RadioGroupItem value="manager" id="manager" />
                <Label htmlFor="manager" className="flex items-center cursor-pointer">
                  <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />
                  <div>
                    <span className="font-medium">Manager</span>
                    <p className="text-xs text-gray-500">Department or senior manager</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
