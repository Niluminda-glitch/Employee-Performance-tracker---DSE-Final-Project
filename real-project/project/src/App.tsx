
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import Analytics from "./pages/Analytics";
import LoadingDemo from "./pages/LoadingDemo";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CursorProvider, useCursor } from "./context/CursorContext";
import StretchReminder from "./components/StretchReminder";
import CursorEffect from "./components/CursorEffect";
import TaskWorkflow from "./pages/TaskWorkflow";
import DatabaseInitializer from "./components/DatabaseInitializer";

// Create the QueryClient outside of the component
const queryClient = new QueryClient();

// AppContent component with cursor effect
const AppContent = () => {
  const location = useLocation();
  const { setCursorDisabled } = useCursor();

  // Determine if cursor effect should be disabled on certain pages
  useEffect(() => {
    // Disable cursor effect on login page when loading is shown
    const isLoginPage = location.pathname === '/';
    setCursorDisabled(isLoginPage);
  }, [location, setCursorDisabled]);

  return (
    <>
      {/* Global cursor effect */}
      <CursorEffect />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/loading-demo" element={<LoadingDemo />} />

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

        {/* Routes accessible by all authenticated users */}
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/mentors"
          element={<ProtectedRoute element={<FindMentor />} />}
        />
        <Route
          path="/wellbeing"
          element={<ProtectedRoute element={<Wellbeing />} />}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute element={<Notifications />} />}
        />

        {/* Employee-specific routes */}
        <Route
          path="/task-workflow"
          element={<ProtectedRoute element={<TaskWorkflow />} requiredRole="employee" />}
        />

        {/* Supervisor functionality */}
        <Route
          path="/team-tasks"
          element={<ProtectedRoute element={<TeamTasks />} requiredRole="supervisor" />}
        />
        <Route
          path="/analytics"
          element={<ProtectedRoute element={<Analytics />} requiredRole={["supervisor", "manager"]} />}
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
    </>
  );
};

// Create the App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <CursorProvider>
              <Toaster />
              <Sonner />
              <div className="text-sm"> {/* Applied global text size wrapper */}
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </div>
            </CursorProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
