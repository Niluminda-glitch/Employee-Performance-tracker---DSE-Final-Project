
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Calendar, Bell, Check, Clock, AlertCircle, LayoutDashboard, User, Settings, Edit,
  CheckCircle2, Coffee, MoreHorizontal, ListFilter, Loader2, RotateCcw, Send, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import TopNavigation from "@/components/TopNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCursorEffect } from "@/hooks/use-cursor-effect";
import NotificationSettings from "@/components/NotificationSettings";
import ProfileEditor from "@/components/ProfileEditor";
import ActiveTaskAssistant from "@/components/ActiveTaskAssistant";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import CreateNotificationModal from "@/components/notifications/CreateNotificationModal";
import MyRequests from "@/components/requests/MyRequests";
import '../styles/dashboard-float.css'; // Floating background shapes

const EmployeeDashboard = () => {
  const { toast } = useToast();
  const { user, api, authLoading } = useAuth(); // Get authenticated user and API instance
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    formatDate
  } = useNotifications(); // Get notifications from context

  // Customize cursor effect for this page
  useCursorEffect({
    size: 60,
    color: 'rgba(139, 92, 246, 0.08)', // Lighter purple for dashboard
    opacity: 0.6,
    blur: 'xl'
  }, []);

  // State for modals
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null); // Track which task is being updated

  // State for upcoming deadlines
  const [upcomingDeadlinesCount, setUpcomingDeadlinesCount] = useState(0);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(false);

  // Fetch tasks from the API
  const fetchTasks = useCallback(async () => {
    if (!user?.id || !api) return;

    console.log('[EmployeeDashboard] Fetching tasks for user');
    setIsLoadingTasks(true);
    setTasksError(null);

    try {
      const response = await api.get('/tasks/my');
      setTasks(response.data || []);
      console.log('[EmployeeDashboard] User tasks fetched:', response.data);
    } catch (err) {
      console.error('[EmployeeDashboard] Failed to fetch user tasks:', err.response?.data || err.message);
      setTasksError(err.response?.data?.message || 'Failed to load your tasks.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user?.id, api]);

  // Fetch upcoming deadlines count from the API
  const fetchUpcomingDeadlinesCount = useCallback(async () => {
    if (!user?.id || !api) return;

    console.log('[EmployeeDashboard] Fetching upcoming deadlines count');
    setIsLoadingDeadlines(true);

    try {
      const response = await api.get('/tasks/my/upcoming');
      console.log('[EmployeeDashboard] API response for upcoming deadlines:', response);
      setUpcomingDeadlinesCount(response.data.count);
    } catch (err) {
      console.error('[EmployeeDashboard] Failed to fetch upcoming deadlines count:', err);
      setUpcomingDeadlinesCount(0);
    } finally {
      setIsLoadingDeadlines(false);
    }
  }, [user?.id, api]);

  // Load tasks when component mounts
  useEffect(() => {
    if (!authLoading) {
      fetchTasks();
      fetchUpcomingDeadlinesCount();
    }
  }, [fetchTasks, fetchUpcomingDeadlinesCount, authLoading]);

  // Handler for updating task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!api) return;

    // Set state before API call
    setUpdatingTaskId(taskId); // Disable button for this task
    setTasksError(null); // Clear previous task-specific errors

    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });

      // Update state locally
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      toast({
        title: "Task Updated",
        description: `Task status has been updated to ${newStatus}.`,
        variant: "default",
      });

      console.log(`[EmployeeDashboard] Task ${taskId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('[EmployeeDashboard] Failed to update task status:', err.response?.data || err.message);
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || 'Failed to update task status.',
        variant: "destructive",
      });
      // Refresh tasks to ensure consistency
      fetchTasks();
    } finally {
      // Clear state after API call (in finally block)
      setUpdatingTaskId(null); // Re-enable button
    }
  };

  // Get filtered tasks based on current filter
  const getFilteredTasks = () => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter(task => task.status === taskFilter);
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Low</Badge>;
      default:
        return null;
    }
  };

  // Helper to format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-purple-50 to-amber-50 pb-24 overflow-x-hidden">
      {/* Floating background shapes */}
      <div className="floating-bg">
        <div className="floating-shape shape1 animate-float" />
        <div className="floating-shape shape2 animate-float" />
        <div className="floating-shape shape3 animate-float" />
        <div className="floating-shape shape4 animate-float" />
      </div>

      <TopNavigation userRole={user?.role} />

      <main className="max-w-7xl mx-auto px-2 md:px-10 pt-6 z-10">
        {/* Dashboard header with chunky card and animation */}
        <div className="relative mb-10">
          <div className="relative w-full max-w-4xl mx-auto animate-slide-up animate-grow rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border-2 border-purple-300/40 shadow-[0_8px_32px_0_rgba(124,58,237,0.10)] px-8 py-10 flex flex-col items-center gap-8 overflow-hidden">
            <img
              src={user?.profile_picture || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-purple-300 shadow-2xl object-cover animate-float bg-gradient-to-br from-purple-100/70 to-pink-100/70"
              style={{ marginTop: '-2rem', boxShadow: '0 8px 32px 0 rgba(168,139,250,0.18)' }}
            />
            <div className="flex-1 flex flex-col justify-center items-center min-w-0">
              <h1 className="text-4xl md:text-5xl font-black text-purple-700 mb-3 tracking-tight drop-shadow-lg animate-slide-right whitespace-nowrap overflow-hidden text-ellipsis text-center">
                Welcome back, {user?.full_name || 'Employee'}!
              </h1>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-3 animate-slide-left">
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-amber-100/90 text-amber-700 font-bold text-base shadow border border-amber-200/60 animate-pulse-slow">
                  <User className="w-5 h-5 mr-2" /> {user?.role || 'Employee'}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold text-base shadow border border-purple-200/60 animate-pulse-slow">
                  <Calendar className="w-5 h-5 mr-2" /> Joined: {user?.created_at ? formatJoinDate(user.created_at) : '---'}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-blue-100/90 text-blue-700 font-bold text-base shadow border border-blue-200/60 animate-pulse-slow">
                  <ClipboardList className="w-5 h-5 mr-2" /> Tasks: {tasks.length}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-green-100/90 text-green-700 font-bold text-base shadow border border-green-200/60 animate-pulse-slow">
                  <Clock className="w-5 h-5 mr-2" /> Upcoming: {upcomingDeadlinesCount}
                </span>
              </div>
              <p className="text-gray-700 font-semibold text-lg animate-slide-up bg-white/60 rounded-xl px-4 py-2 shadow border border-purple-100/40 text-center">
                Stay productive and keep track of your performance, tasks, and notifications below!
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gradient animate-fade-in">Employee Dashboard</h1>
            <p className="text-gray-500 animate-slide-up">Welcome back! Here's an overview of your tasks and activities.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateNotificationOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-100 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-400/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -left-6 w-24 h-24 bg-purple-400/10 rounded-full blur-lg"></div>

            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
                <span className="relative">
                  Tasks
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400/50 to-transparent"></span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3 shadow-sm relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-purple-100/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <ClipboardList className="h-5 w-5 text-purple-500 relative z-10" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {tasks.length}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 font-medium rounded-full shadow-sm hover:shadow-md transition-shadow hover:bg-purple-200/80">
                  {tasks.filter(task => task.status !== "completed").length} pending
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                  style={{
                    width: `${(tasks.filter(task => task.status === "completed").length / (tasks.length || 1)) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(tasks.filter(task => task.status === "completed").length / (tasks.length || 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-purple-500">Progress</span>
                <span className="text-xs font-medium text-purple-700">
                  {Math.round((tasks.filter(task => task.status === "completed").length / (tasks.length || 1)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-200 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-lg"></div>

            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                <span className="relative">
                  Upcoming Deadlines
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400/50 to-transparent"></span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3 shadow-sm relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-100/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Calendar className="h-5 w-5 text-blue-500 relative z-10" />
                  </div>
                  {isLoadingDeadlines ? (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                      {upcomingDeadlinesCount}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-medium rounded-full shadow-sm hover:shadow-md transition-shadow hover:bg-blue-200/80">
                  This week
                </span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-2 rounded-full shadow-sm ${i < upcomingDeadlinesCount ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-200'}`}
                    initial={{ height: 0 }}
                    animate={{ height: 8 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-blue-500">Days with deadlines</span>
                <span className="text-xs font-medium text-blue-700">
                  {upcomingDeadlinesCount} of 7 days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-300 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -left-6 w-24 h-24 bg-amber-400/10 rounded-full blur-lg"></div>

            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center">
                <span className="relative">
                  Notifications
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400/50 to-transparent"></span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg mr-3 shadow-sm relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-amber-100/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Bell className="h-5 w-5 text-amber-500 relative z-10" />
                  </div>
                  {notificationsLoading ? (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 font-medium rounded-full shadow-sm hover:shadow-md transition-shadow hover:bg-amber-200/80">
                  {notifications.filter(n => !n.is_read).length > 0 ? `${notifications.filter(n => !n.is_read).length} unread` : 'All read'}
                </span>
              </div>
              <div className="mt-4 flex space-x-1.5">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={`flex-1 h-2 rounded-full shadow-sm ${!notification.is_read ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-amber-200'}`}
                      initial={{ height: 0 }}
                      animate={{ height: 8 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    />
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 h-2 rounded-full bg-gray-200 shadow-sm"
                      initial={{ height: 0 }}
                      animate={{ height: 8 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    />
                  ))
                )}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-amber-500">Recent notifications</span>
                <span className="text-xs font-medium text-amber-700">
                  {notifications.filter(n => !n.is_read).length} unread
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="work" className="mb-8 animate-fade-in">
          <TabsList className="p-1 bg-purple-50 rounded-xl border border-purple-100 mb-6">
            <TabsTrigger value="overview" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="work" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4 mr-2" />
              Work
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work" className="animate-slide-up">
            <div className="space-y-6">
              <Card className="shadow-card border border-purple-100/80 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gradient">Active Task Assistant</CardTitle>
                    <CardDescription>Get real-time guidance for your current task</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/task-workflow'}
                    className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Full Workflow View
                  </Button>
                </CardHeader>
                <CardContent>
                  {console.log("[EmployeeDashboard] Rendering ActiveTaskAssistant component")}
                  <ActiveTaskAssistant />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="animate-slide-up">
            <div className="space-y-6">
              <MyRequests />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="animate-slide-up">
            <Card className="shadow-card border border-purple-100/80 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-indigo-100/40 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gradient">Employee Profile Summary</CardTitle>
                  <CardDescription>Your current status and information</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNotificationSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-1" /> Notification Settings
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setProfileEditorOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-6">
                {authLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-purple-600">Loading profile...</span>
                  </div>
                ) : user ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto md:mx-0">
                        {user.full_name ? (
                          <span className="text-3xl font-semibold text-white">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="h-12 w-12 text-white" />
                        )}
                      </div>
                      <div className="mt-4 text-center md:text-left">
                        <h3 className="font-semibold text-lg">{user.full_name || 'User Name'}</h3>
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mt-1">
                          {user.job_title || user.role || 'Employee'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                        <h3 className="text-sm font-medium text-purple-700 mb-2">Department</h3>
                        <p className="font-medium">
                          {user.userDepartment?.name || <span className="italic text-gray-400">Not Assigned</span>}
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-xs text-gray-500">Employee ID: {user.id ? `ID-${user.id.slice(-6).toUpperCase()}` : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                        <h3 className="text-sm font-medium text-purple-700 mb-2">Manager</h3>
                        <p className="font-medium">
                          {user.supervisor?.full_name || <span className="italic text-gray-400">Not Assigned</span>}
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-xs text-gray-500">Role: {user.role}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                        <h3 className="text-sm font-medium text-purple-700 mb-2">Status</h3>
                        <p className={`font-medium capitalize flex items-center ${user.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {user.status || 'Unknown'}
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-xs text-gray-500">Email: {user.email}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                        <h3 className="text-sm font-medium text-purple-700 mb-2">Joined</h3>
                        <p className="font-medium">
                          {formatJoinDate(user.createdAt)}
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-xs text-gray-500">
                            {user.createdAt ? `Member for ${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30))} months` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Could not load profile information.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="animate-slide-up">
            <Card className="shadow-card border border-purple-100/80 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-indigo-100/40 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <CardTitle className="text-xl text-gradient">My Tasks</CardTitle>
                  <CardDescription>Track your progress on assigned tasks</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="bg-white rounded-lg border border-purple-100 flex p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={taskFilter === 'all' ? "bg-purple-100 text-purple-700" : ""}
                      onClick={() => setTaskFilter('all')}
                    >
                      <ListFilter className="h-4 w-4 mr-1" /> All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={taskFilter === 'pending' ? "bg-amber-100 text-amber-700" : ""}
                      onClick={() => setTaskFilter('pending')}
                    >
                      <Clock className="h-4 w-4 mr-1" /> Pending
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={taskFilter === 'in-progress' ? "bg-blue-100 text-blue-700" : ""}
                      onClick={() => setTaskFilter('in-progress')}
                    >
                      <Coffee className="h-4 w-4 mr-1" /> In Progress
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={taskFilter === 'completed' ? "bg-green-100 text-green-700" : ""}
                      onClick={() => setTaskFilter('completed')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                {isLoadingTasks ? (
                  <div className="text-center py-16 bg-purple-50/30 rounded-lg border border-purple-100/50">
                    <Loader2 className="h-12 w-12 mx-auto mb-3 text-purple-500 animate-spin" />
                    <h3 className="text-lg font-medium text-purple-700 mb-1">Loading tasks...</h3>
                    <p className="text-purple-500 text-sm">Please wait while we fetch your tasks</p>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-16 bg-red-50/30 rounded-lg border border-red-100/50">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                    <h3 className="text-lg font-medium text-red-700 mb-1">Error loading tasks</h3>
                    <p className="text-red-500 text-sm">{tasksError}</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={fetchTasks}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : getFilteredTasks().length === 0 ? (
                  <div className="text-center py-16 bg-purple-50/30 rounded-lg border border-purple-100/50">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                    <h3 className="text-lg font-medium text-purple-700 mb-1">No tasks found</h3>
                    <p className="text-purple-500 text-sm">
                      {taskFilter === 'all'
                        ? "You don't have any tasks assigned yet."
                        : `You don't have any ${taskFilter} tasks at the moment.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredTasks().map((task, index) => (
                      <div
                        key={task.id}
                        className="group animate-slide-up"
                        style={{ animationDelay: `${index * 100 + 100}ms` }}
                      >
                        <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-purple-300">
                          <div className="flex items-center p-4 border-l-4"
                            style={{
                              borderLeftColor: task.priority === 'high' ? '#f87171' :
                                            task.priority === 'medium' ? '#fbbf24' : '#4ade80'
                            }}
                          >
                            <div className="flex-shrink-0 mr-4">
                              {task.status === 'pending' && (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                                  <Clock className="h-4 w-4 text-amber-700" />
                                </span>
                              )}
                              {task.status === 'in-progress' && (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                  <Coffee className="h-4 w-4 text-blue-700" />
                                </span>
                              )}
                              {task.status === 'completed' && (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                  {task.title}
                                </h3>
                                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                  {getPriorityBadge(task.priority)}
                                </div>
                              </div>

                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                              </div>
                            </div>

                            <div className="ml-4 flex-shrink-0">
                              <div className="flex space-x-2">
                                {/* Always show the appropriate action button based on task status */}
                                {task.status === 'pending' && (
                                  <Button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                    disabled={updatingTaskId === task.id}
                                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                    title="Start working on this task"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Start Task
                                  </Button>
                                )}

                                {task.status === 'in-progress' && (
                                  <Button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                    disabled={updatingTaskId === task.id}
                                    className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                                    title="Mark this task as complete"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Complete Task
                                  </Button>
                                )}

                                {task.status === 'completed' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                    disabled={updatingTaskId === task.id}
                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                    title="Reopen this task"
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reopen Task
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {task.status === 'in-progress' && (
                            <div className="bg-blue-50 px-4 py-2 flex items-center justify-between">
                              <span className="text-xs text-blue-700 font-medium flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                                In progress
                              </span>
                              <span className="text-xs text-blue-600">Started on April 16, 2025</span>
                            </div>
                          )}

                          {task.status === 'completed' && (
                            <div className="bg-green-50 px-4 py-2 flex items-center justify-between">
                              <span className="text-xs text-green-700 font-medium flex items-center">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Completed
                              </span>
                              <span className="text-xs text-green-600">Finished on April 15, 2025</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="animate-slide-up">
            <Card className="shadow-card border border-purple-100/80 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100/50 to-orange-100/40 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <CardTitle className="text-xl text-gradient">My Notifications</CardTitle>
                  <CardDescription>Latest notifications and updates</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => window.location.href = '/notifications'}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  All Notifications
                </Button>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                {notificationsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
                    <span className="ml-2 text-amber-600">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16 bg-amber-50/30 rounded-lg border border-amber-100/50">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-amber-300" />
                    <h3 className="text-lg font-medium text-amber-700 mb-1">No notifications</h3>
                    <p className="text-amber-500 text-sm">You don't have any notifications at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`relative border border-purple-100 hover:border-purple-300 rounded-xl p-5 pl-7 transition-all bg-white hover:shadow-md hover:-translate-y-0.5 duration-300 animate-slide-up ${!notification.is_read ? 'bg-amber-50/30' : ''}`}
                        style={{ animationDelay: `${index * 100 + 100}ms` }}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${!notification.is_read ? 'bg-gradient-to-b from-amber-400 to-amber-500' : 'bg-gradient-to-b from-gray-300 to-gray-400'}`}></div>
                        <h3 className="font-medium text-lg mb-2 text-gray-800">{notification.title}</h3>
                        <div className="flex items-center mb-3">
                          <Calendar className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                          <p className="text-xs text-amber-600 font-medium">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                          {notification.message}
                        </p>
                        {notification.relatedUser && (
                          <div className="flex items-center mt-3">
                            <User className="h-3.5 w-3.5 text-purple-600 mr-1.5" />
                            <p className="text-xs text-purple-700">
                              From: {notification.relatedUser.full_name}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 -mr-2"
                            onClick={() => window.location.href = '/notifications'}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Decorative floating elements for extra visual pop (foreground, non-interactive) */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <div className="absolute left-10 top-1/3 w-12 h-12 bg-purple-300/40 rounded-full animate-float blur-2xl" style={{animationDuration:'7s'}} />
        <div className="absolute right-16 top-1/4 w-16 h-16 bg-amber-300/30 rounded-full animate-float blur-2xl" style={{animationDuration:'8s', animationDelay:'1s'}} />
        <div className="absolute left-1/2 bottom-20 w-20 h-20 bg-blue-300/30 rounded-full animate-float blur-2xl" style={{animationDuration:'6s', animationDelay:'2s'}} />
      </div>
      {/* Modal components */}
      <NotificationSettings
        open={notificationSettingsOpen}
        onOpenChange={setNotificationSettingsOpen}
      />

      <ProfileEditor
        open={profileEditorOpen}
        onOpenChange={setProfileEditorOpen}
      />

      <CreateNotificationModal
        open={createNotificationOpen}
        onOpenChange={setCreateNotificationOpen}
      />
    </div>
  );
};  

export default EmployeeDashboard;

