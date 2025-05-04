import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import { Eye, EyeOff, LogIn, AtSign, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AuthDebugger from "@/components/AuthDebugger";
import { getDashboardPathForRole } from "@/lib/auth";
import FirstTimeLoginForm from "@/components/FirstTimeLoginForm";
import LoadingAnimation from "@/components/LoadingAnimation";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, googleLogin, resetPassword, isFirstLogin, firstTimeSetup, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [showFirstTimeLogin, setShowFirstTimeLogin] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{ email: string, password: string } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Check for first-time login credentials in localStorage
  useEffect(() => {
    const storedCredentials = localStorage.getItem('temp_credentials');
    if (storedCredentials) {
      try {
        const credentials = JSON.parse(storedCredentials);
        if (credentials.isFirstTimeLogin) {
          setTempCredentials({
            email: credentials.email,
            password: credentials.password
          });
          setShowFirstTimeLogin(true);
        }
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
        localStorage.removeItem('temp_credentials');
      }
    }

    // Simulate initial loading for a better user experience
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 2500); // Show loading screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Add useEffect for redirection after successful login
  useEffect(() => {
    console.log('[Index] Auth state changed:', { isAuthenticated, user, authLoading, isFirstLogin });

    if (isAuthenticated && user && !authLoading) {
      if (isFirstLogin) {
        console.log('[Index] User needs to complete first-time setup');
        // The first-time login form will be shown
        return;
      }

      console.log('[Index] Redirecting to dashboard for role:', user.role);
      const dashboardPath = getDashboardPathForRole(user.role);
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, authLoading, isFirstLogin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call login and check the result
      const success = await login(username, password);

      if (!success) {
        // Check if we need to show the first-time login form
        const storedCredentials = localStorage.getItem('temp_credentials');
        if (storedCredentials) {
          try {
            const credentials = JSON.parse(storedCredentials);
            if (credentials.isFirstTimeLogin) {
              setTempCredentials({
                email: credentials.email,
                password: credentials.password
              });
              setShowFirstTimeLogin(true);
            }
          } catch (error) {
            console.error('Error parsing stored credentials:', error);
            localStorage.removeItem('temp_credentials');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstTimeSetupSuccess = () => {
    setShowFirstTimeLogin(false);
    setTempCredentials(null);
    // The auth context will handle redirection after successful setup
  };

  const handleForgotPassword = async () => {
    if (!username || !username.includes("@")) {
      toast.error("Please enter a valid email address first");
      return;
    }

    try {
      await resetPassword(username);
      // Toast is shown by the resetPassword function
    } catch (error) {
      console.error("Error in handleForgotPassword:", error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      // Real Google OAuth login via Supabase
      await googleLogin();
      // The redirect will happen automatically, and the auth state listener
      // will handle the session when the user returns from Google
    } catch (error) {
      console.error("Error in handleGoogleLogin:", error);
      setIsGoogleLoading(false);
    }
  };

  // Track mouse position for cursor-responsive animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // If initial loading is shown, only render the loading screen
  if (showInitialLoading) {
    return <LoadingScreen loaderType="hash" />;
  }

  // Otherwise render the login page
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-mesh-gradient"
      style={{ cursor: 'default' }}
    >
      {/* Background decorative elements */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-[10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-[20%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-40 right-[15%] w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 3
          }}
        />

        <motion.div
          className="absolute top-20 right-[20%] w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl opacity-30 rotate-12"
          animate={{
            y: [0, -10, 0],
            rotate: [12, 14, 12]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-[30%] w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl opacity-20 -rotate-12"
          animate={{
            y: [0, -8, 0],
            rotate: [-12, -10, -12]
          }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        <motion.div
          className="absolute top-1/2 left-[15%] w-24 h-8 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 rotate-45"
          animate={{
            y: [0, -5, 0],
            rotate: [45, 48, 45]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
            delay: 2.5
          }}
        />

        {/* Add cursor-responsive elements */}
        <motion.div
          className="fixed w-40 h-40 rounded-full bg-purple-400/10 mix-blend-multiply filter blur-xl pointer-events-none"
          animate={{
            scale: [1, 1.05, 1, 0.95, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
          style={{
            left: mousePosition.x - 80,
            top: mousePosition.y - 80,
            opacity: 0.5
          }}
        />

        {/* Glitter effect that follows cursor */}
        <motion.div
          className="fixed w-6 h-6 rounded-full bg-white pointer-events-none z-50"
          style={{
            left: mousePosition.x - 3,
            top: mousePosition.y - 3,
            boxShadow: '0 0 10px 2px rgba(167, 139, 250, 0.3), 0 0 20px 6px rgba(167, 139, 250, 0.2)',
            opacity: 0.6,
            mixBlendMode: 'screen'
          }}
        />

        {/* Small particles that follow cursor with delay */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-2 h-2 rounded-full bg-purple-300 pointer-events-none"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              opacity: 0.6 - (i * 0.1)
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
              opacity: [0.6 - (i * 0.1), 0],
              scale: [1, 0]
            }}
            transition={{
              duration: 1 + (i * 0.2),
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.1
            }}
          />
        ))}
      </motion.div>

      {/* Main content container with proper vertical spacing */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo and title section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 0.2
          }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl font-bold text-gradient-enhanced mb-3"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.3
            }}
          >
            EmpTrack
          </motion.h1>
          <motion.p
            className="text-sm text-purple-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Employee Management System
          </motion.p>
        </motion.div>

        {/* Login card or First-time login form */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.3
          }}
          className="w-full max-w-md z-10 relative"
          whileHover={{
            boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)"
          }}
        >
        {showFirstTimeLogin && tempCredentials ? (
          <Card className="shadow-elevation-3 border-purple-100/80 backdrop-blur-md bg-white/95 rounded-2xl overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.5
              }}
            ></motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 pointer-events-none"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.98, 1, 0.98]
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }}
            ></motion.div>
            <CardContent className="pt-6">
              <FirstTimeLoginForm
                email={tempCredentials.email}
                currentPassword={tempCredentials.password}
                onSuccess={handleFirstTimeSetupSuccess}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elevation-3 border-purple-100/80 backdrop-blur-md bg-white/95 rounded-2xl overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.5
              }}
            ></motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 pointer-events-none"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.98, 1, 0.98]
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }}
            ></motion.div>

            <CardHeader className="space-y-1 text-center relative">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="mx-auto mb-5 relative group cursor-pointer"
              >
                <motion.div
                  className="absolute -inset-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 -z-10"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                ></motion.div>
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-all duration-300">
                  <motion.div
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "easeInOut"
                    }}
                  >
                    <LogIn className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.4
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <CardTitle className="text-3xl font-bold tracking-tight text-gradient-enhanced">
                    Welcome Back
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <CardDescription className="text-gray-500">
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </motion.div>
              </motion.div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.6
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username or Email
                    </Label>
                  </motion.div>
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    whileFocus={{ scale: 1.01 }}
                  >
                    <motion.div
                      className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center"
                      whileHover={{
                        backgroundColor: "rgb(243 232 255)",
                        color: "rgb(168 85 247)"
                      }}
                    >
                      <AtSign className="h-3.5 w-3.5" />
                    </motion.div>
                    <Input
                      id="username"
                      placeholder="your.email@company.com"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
                      required
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.8
                  }}
                >
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  >
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <motion.button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Forgot password?
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    whileFocus={{ scale: 1.01 }}
                  >
                    <motion.div
                      className="absolute left-3 top-3 h-6 w-6 text-purple-400 rounded-full bg-purple-50 flex items-center justify-center"
                      whileHover={{
                        backgroundColor: "rgb(243 232 255)",
                        color: "rgb(168 85 247)"
                      }}
                    >
                      <Lock className="h-3.5 w-3.5" />
                    </motion.div>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-6 w-6 rounded-full hover:bg-purple-50 flex items-center justify-center text-muted-foreground hover:text-purple-600 transition-colors"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgb(243 232 255)",
                        color: "rgb(168 85 247)"
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: showPassword ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showPassword ?
                          <EyeOff className="h-3.5 w-3.5" /> :
                          <Eye className="h-3.5 w-3.5" />
                        }
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 1.0
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                  >
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                      className="text-purple-600 border-purple-200 focus:ring-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </motion.div>
                  <Label
                    htmlFor="remember-me"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Remember me for 30 days
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 1.1
                  }}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium btn-gradient rounded-xl relative overflow-hidden group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <LoadingAnimation
                            type="beat"
                            size={8}
                            color="#ffffff"
                            speedMultiplier={0.7}
                            className="mr-2"
                          />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center relative z-10">
                          <motion.div
                            animate={{ x: [0, 2, 0, -2, 0] }}
                            transition={{
                              repeat: Infinity,
                              repeatType: "mirror",
                              duration: 1.5,
                              ease: "easeInOut",
                              repeatDelay: 0.5
                            }}
                          >
                            <LogIn className="h-5 w-5 mr-2" />
                          </motion.div>
                          <span>Sign in to Dashboard</span>
                        </div>
                      )}

                      {/* Button hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        initial={false}
                        whileHover={{
                          opacity: [0, 0.1, 0],
                          scale: [1, 1.05, 1],
                          transition: {
                            opacity: { repeat: Infinity, duration: 1.5 },
                            scale: { repeat: Infinity, duration: 1.5 }
                          }
                        }}
                      />
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0.9 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{
                    delay: 1.2,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                >
                  <SeparatorWithText
                    text="OR CONTINUE WITH"
                    className="text-gray-400 text-xs font-medium my-6"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 1.3
                  }}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-300 shadow-sm rounded-xl relative overflow-hidden"
                      onClick={handleGoogleLogin}
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <div className="flex items-center justify-center">
                          <LoadingAnimation
                            type="pulse"
                            size={8}
                            color="#6366f1"
                            speedMultiplier={0.7}
                            className="mr-2"
                          />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <motion.div
                            className="bg-white p-0.5 rounded mr-3"
                            animate={{
                              rotate: [0, 0, 0, 0, 0, 0, 0, 0, 0, 10, -10, 0]
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 6,
                              ease: "easeInOut",
                              times: [0, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
                            }}
                          >
                            <motion.svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              whileHover={{ scale: 1.1 }}
                            >
                              <motion.path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.4, duration: 0.5 }}
                              />
                              <motion.path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23 12 23z"
                                fill="#34A853"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                              />
                              <motion.path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.6, duration: 0.5 }}
                              />
                              <motion.path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.7, duration: 0.5 }}
                              />
                              <path d="M1 1h22v22H1z" fill="none" />
                            </motion.svg>
                          </motion.div>
                          <motion.span
                            className="font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.8, duration: 0.3 }}
                          >
                            Continue with Google
                          </motion.span>
                        </div>
                      )}

                      {/* Button hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-gray-50 opacity-0"
                        initial={false}
                        whileHover={{
                          opacity: 1,
                          transition: { duration: 0.2 }
                        }}
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>

            <CardFooter className="text-center text-xs text-muted-foreground flex flex-col space-y-2">
              <motion.p
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.5 }}
              >
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                <a
                  href="/loading-demo"
                  className="text-purple-500 hover:text-purple-700 transition-colors text-xs font-medium"
                >
                  Check out our loading animations demo
                </a>
              </motion.div>
            </CardFooter>
          </Card>
        )}
        </motion.div>
      </div>

      {/* Auth Debugger Component */}
      {isAuthenticated && <AuthDebugger />}
    </div>
  );
};

export default Index;
