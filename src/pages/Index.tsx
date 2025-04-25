
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import { Eye, EyeOff, Key, LogIn, User, Lock, AtSign } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const userRole = login(username, password, rememberMe);
      setIsLoading(false);
      if (userRole) {
        // Navigate to the appropriate dashboard based on role
        if (userRole === 'employee') {
          navigate("/employee-dashboard");
        } else if (userRole === 'supervisor') {
          navigate("/supervisor-dashboard");
        } else if (userRole === 'manager') {
          navigate("/manager-dashboard");
        }
      }
    }, 800); // Reduced login time for better UX
  };

  const handleForgotPassword = () => {
    if (!username || !username.includes("@")) {
      toast.error("Please enter a valid email address first");
      return;
    }
    toast.info("Password reset link sent", {
      description: `Check your email at ${username}`
    });
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);

    // Simulate Google login - would connect to actual OAuth in a real app
    setTimeout(() => {
      toast.success("Google login successful!");
      setIsGoogleLoading(false);

      // For demo, always navigate to employee dashboard with Google login
      navigate("/employee-dashboard");
    }, 1000); // Reduced wait time
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-mesh-gradient">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background blobs */}
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-[20%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" 
             style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-[15%] w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" 
             style={{ animationDelay: '3s' }}></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-[20%] w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl opacity-30 rotate-12 animate-float"></div>
        <div className="absolute bottom-32 left-[30%] w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl opacity-20 -rotate-12 animate-float" 
             style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-[15%] w-24 h-8 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 rotate-45 animate-float" 
             style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md z-10 relative"
      >
        {/* Logo and App Title */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.3, duration: 0.6 }} 
            className="absolute top-0 w-full text-center"
          >
            <h1 className="text-5xl font-bold text-gradient-enhanced mb-3">EmpTrack</h1>
            <p className="text-sm text-purple-600 font-medium">Employee Management System</p>
          </motion.div>
        </div>
        
        {/* Login Card */}
        <Card className="shadow-elevation-3 border-purple-100/80 backdrop-blur-md bg-white/95 rounded-2xl overflow-hidden mt-16">
          {/* Colorful top stripe */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>
          
          <CardHeader className="space-y-1 text-center relative">
            {/* Login Icon */}
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, duration: 0.5 }} 
              className="mx-auto mb-5 relative group"
            >
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-all duration-300">
                <LogIn className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            
            {/* Login Title and Description */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold tracking-tight text-gradient-enhanced">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to access your dashboard
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <motion.div 
                className="space-y-3" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username or Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center">
                    <AtSign className="h-3.5 w-3.5" />
                  </div>
                  <Input 
                    id="username" 
                    placeholder="your.email@company.com" 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="pl-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200" 
                    required 
                  />
                </div>
                
                {/* Demo Accounts Box */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-xl p-3 border border-purple-100">
                  <p className="text-xs text-purple-700 font-medium mb-2">Demo accounts:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="text-xs bg-white/95 p-2 rounded-lg border border-purple-100/80 text-gray-700 flex items-center">
                      <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-medium mr-2">
                        Employee
                      </span>
                      <code className="font-mono">employee@emptrack.com / employee123</code>
                    </div>
                    <div className="text-xs bg-white/95 p-2 rounded-lg border border-purple-100/80 text-gray-700 flex items-center">
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-medium mr-2">
                        Supervisor
                      </span>
                      <code className="font-mono">supervisor@emptrack.com / supervisor123</code>
                    </div>
                    <div className="text-xs bg-white/95 p-2 rounded-lg border border-purple-100/80 text-gray-700 flex items-center">
                      <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-medium mr-2">
                        Manager
                      </span>
                      <code className="font-mono">manager@emptrack.com / manager123</code>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Password Field */}
              <motion.div 
                className="space-y-3" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword} 
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <Input 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="pl-10 pr-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 h-6 w-6 rounded-full hover:bg-purple-50 flex items-center justify-center text-muted-foreground hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? 
                      <EyeOff className="h-3.5 w-3.5" /> : 
                      <Eye className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </motion.div>
              
              {/* Remember Me Checkbox */}
              <motion.div 
                className="flex items-center space-x-2" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe} 
                  onCheckedChange={(checked: boolean) => setRememberMe(checked)} 
                  className="text-purple-600 border-purple-200 focus:ring-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" 
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </Label>
              </motion.div>
              
              {/* Sign In Button */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium btn-gradient rounded-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                        className="w-5 h-5 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" 
                      />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      <span>Sign in to Dashboard</span>
                    </div>
                  )}
                </Button>
              </motion.div>
              
              {/* OR Separator */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <SeparatorWithText 
                  text="OR CONTINUE WITH" 
                  className="text-gray-400 text-xs font-medium my-6" 
                />
              </motion.div>
              
              {/* Google Login Button */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:scale-[1.01] active:scale-[0.99] hover:border-gray-300 shadow-sm rounded-xl" 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                        className="w-5 h-5 border-2 border-gray-400 border-opacity-50 border-t-gray-600 rounded-full mr-2" 
                      />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="bg-white p-0.5 rounded mr-3">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                      </div>
                      <span className="font-medium">Continue with Google</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          
          <CardFooter className="text-center text-xs text-muted-foreground">
            <p className="w-full">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;
