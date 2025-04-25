import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Profile from "./pages/Profile";
import FindMentor from "./pages/FindMentor";
import Wellbeing from "./pages/Wellbeing";
import Notifications from "./pages/Notifications";
import TeamTasks from "./pages/TeamTasks";
import TeamManagement from "./pages/TeamManagement";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";
import StretchReminder from "./components/StretchReminder";
import TaskWorkflow from "./pages/TaskWorkflow";
import DebugAuth from "./components/auth/DebugAuth";
import SupabaseTest from "./pages/SupabaseTest";

// Create the QueryClient outside of the component
const queryClient = new QueryClient();

// Create the App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <div className="text-sm">
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/reset-password" element={<Auth resetMode={true} />} />
                <Route path="/auth/debug" element={<DebugAuth />} />
                <Route path="/test" element={<SupabaseTest />} />

                {/* Role-specific dashboards */}
                <Route
                  path="/employee-dashboard"
                  element={<ProtectedRoute element={<EmployeeDashboard />} requiredRole="employee" />}
                />
                <Route
                  path="/supervisor-dashboard"
                  element={<ProtectedRoute element={<SupervisorDashboard />} requiredRole="supervisor" />}
                />
                <Route
                  path="/manager-dashboard"
                  element={<ProtectedRoute element={<ManagerDashboard />} requiredRole="manager" />}
                />

                {/* Employee accessible routes */}
                <Route
                  path="/profile"
                  element={<ProtectedRoute element={<Profile />} requiredRole="employee" />}
                />
                <Route
                  path="/find-mentor"
                  element={<ProtectedRoute element={<FindMentor />} requiredRole="employee" />}
                />
                <Route
                  path="/wellbeing"
                  element={<ProtectedRoute element={<Wellbeing />} requiredRole="employee" />}
                />
                <Route
                  path="/notifications"
                  element={<ProtectedRoute element={<Notifications />} requiredRole="employee" />}
                />
                <Route
                  path="/task-workflow"
                  element={<ProtectedRoute element={<TaskWorkflow />} requiredRole="employee" />}
                />

                {/* Supervisor functionality */}
                <Route
                  path="/team-tasks"
                  element={<ProtectedRoute element={<TeamTasks />} requiredRole="supervisor" />}
                />

                {/* Manager functionality */}
                <Route
                  path="/team-management"
                  element={<ProtectedRoute element={<TeamManagement />} requiredRole="manager" />}
                />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Global StretchReminder component */}
              <StretchReminder />
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
