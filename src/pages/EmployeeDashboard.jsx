import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Calendar, Bell, Check, Clock, AlertCircle, LayoutDashboard, User, Settings, Edit,
  CheckCircle2, Coffee, MoreHorizontal, ListFilter, Loader2, RotateCcw, Send, PlusCircle,
  AlertTriangle, Sparkles, Building, Mail, UserCircle, BadgeCheck, CalendarDays, Users,
  Star, Award, Briefcase, Shield, Zap
} from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NotificationSettings from "@/components/NotificationSettings";
import ProfileEditor from "@/components/ProfileEditor";
import ActiveTaskAssistant from "@/components/ActiveTaskAssistant";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import CreateNotificationModal from "@/components/notifications/CreateNotificationModal";
import MyRequests from "@/components/requests/MyRequests";
import RequestForm from "@/components/requests/RequestForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getTimelinessInfo, formatDate } from "@/lib/taskUtils";

const EmployeeDashboard = () => {
  console.log('[EmployeeDashboard] Component mounting');
  const { toast } = useToast();
  const { user, api, authLoading } = useAuth(); // Get authenticated user and API instance
  console.log('[EmployeeDashboard] Auth context:', { user: !!user, api: !!api, authLoading });

  // Try to use the NotificationContext, but provide fallbacks if it's not available
  let unreadCount = 0;
  let fetchUnreadCount = () => {};

  try {
    const notificationContext = useNotifications();
    unreadCount = notificationContext.unreadCount;
    fetchUnreadCount = notificationContext.fetchUnreadCount;
  } catch (error) {
    console.error('NotificationContext not available:', error);
    // Fallback values already set above
  }

  // State for modals
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // State for upcoming deadlines
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [upcomingDeadlinesCount, setUpcomingDeadlinesCount] = useState(0); // Initialize to 0
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(false);

  // State for notifications
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

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
    if (!user?.id || !api) {
      console.log('[EmployeeDashboard] Cannot fetch upcoming deadlines: user or api not available', { userId: user?.id, apiExists: !!api });
      return;
    }

    console.log('[EmployeeDashboard] Fetching upcoming deadlines count');
    setIsLoadingDeadlines(true);

    try {
      // First try the test endpoint to verify route registration
      console.log('[EmployeeDashboard] Making test API call to /tasks/test-upcoming');
      try {
        const testResponse = await api.get('/tasks/test-upcoming');
        console.log('[EmployeeDashboard] Test API response:', testResponse.data);
      } catch (testErr) {
        console.error('[EmployeeDashboard] Test API call failed:', testErr);
      }

      // Now try the actual endpoint
      console.log('[EmployeeDashboard] Making API call to /tasks/my/upcoming');
      console.log('[EmployeeDashboard] API instance:', api);
      console.log('[EmployeeDashboard] API headers:', api.defaults.headers);

      const response = await api.get('/tasks/my/upcoming');
      console.log('[EmployeeDashboard] API response for upcoming deadlines:', response);

      // Set the actual count from the API response
      setUpcomingDeadlinesCount(response.data.count);
      console.log('[EmployeeDashboard] Upcoming deadlines count set to:', response.data.count);
    } catch (err) {
      console.error('[EmployeeDashboard] Failed to fetch upcoming deadlines count:', err);
      console.error('[EmployeeDashboard] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setUpcomingDeadlinesCount(0);
    } finally {
      setIsLoadingDeadlines(false);
    }
  }, [user?.id, api]);

  // Calculate upcoming deadlines from tasks
  const calculateUpcomingDeadlines = useCallback(() => {
    if (!tasks.length) {
      setUpcomingDeadlines([]);
      return;
    }

    // Get current date and end of week
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison

    // Filter tasks with due dates in the next 7 days that are not completed
    const upcoming = tasks.filter(task => {
      if (!task.due_date) return false;
      if (task.status === 'completed') return false;

      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= endOfWeek;
    });

    console.log('[EmployeeDashboard] Upcoming deadlines calculated:', upcoming.length);
    setUpcomingDeadlines(upcoming);
  }, [tasks]);

  // Load tasks when component mounts
  useEffect(() => {
    if (!authLoading) {
      console.log('[EmployeeDashboard] Auth loaded, fetching data...');
      fetchTasks();
      fetchUnreadCount();

      // Fetch upcoming deadlines count
      fetchUpcomingDeadlinesCount();

      // Force a direct API call as a test
      if (api) {
        // Try the direct test endpoint in server.js
        console.log('[EmployeeDashboard] Making direct test API call to /test-upcoming');
        api.get('/test-upcoming')
          .then(response => {
            console.log('[EmployeeDashboard] Direct test API call succeeded:', response.data);
          })
          .catch(error => {
            console.error('[EmployeeDashboard] Direct test API call failed:', error);
          });

        // Try the test endpoint in tasks.js
        console.log('[EmployeeDashboard] Making test API call to /tasks/test-upcoming');
        api.get('/tasks/test-upcoming')
          .then(response => {
            console.log('[EmployeeDashboard] Test API call succeeded:', response.data);

            // Now try the actual endpoint
            console.log('[EmployeeDashboard] Making API call to /tasks/my/upcoming');
            return api.get('/tasks/my/upcoming');
          })
          .then(response => {
            console.log('[EmployeeDashboard] API call succeeded:', response.data);
          })
          .catch(error => {
            console.error('[EmployeeDashboard] API call failed:', error);
          });
      }
    }
  }, [fetchTasks, fetchUpcomingDeadlinesCount, fetchUnreadCount, authLoading, api]);

  // Calculate upcoming deadlines whenever tasks change
  useEffect(() => {
    calculateUpcomingDeadlines();
  }, [tasks, calculateUpcomingDeadlines]);

  // Task status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in-progress':
        return <Coffee className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  // Debug log
  console.log('[EmployeeDashboard] Rendering with state:', {
    upcomingDeadlinesCount,
    tasksLength: tasks.length,
    upcomingDeadlinesLength: upcomingDeadlines.length,
    isLoadingDeadlines
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gradient animate-fade-in">Employee Dashboard</h1>
            <p className="text-gray-500 animate-slide-up">Welcome back! Here's an overview of your tasks and activities.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateRequestOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Request
            </Button>
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
          {/* Tasks Card */}
          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-100 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
                <ClipboardList className="h-4 w-4 mr-1.5 inline" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500 mr-2" />
                  <span className="text-sm text-purple-500">Loading...</span>
                </div>
              ) : tasksError ? (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Failed to load tasks</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-purple-100 rounded-lg mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <ClipboardList className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">{tasks.length}</span>
                      <p className="text-xs text-gray-500 mt-0.5">Assigned tasks</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></div>
                      <span className="text-xs text-gray-600 font-medium">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                    </div>
                    <div className="flex items-center mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></div>
                      <span className="text-xs text-gray-600 font-medium">{tasks.filter(t => t.status === 'in-progress').length} In Progress</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-xs text-gray-600 font-medium">{tasks.filter(t => t.status === 'completed').length} Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines Card */}
          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-200 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 inline" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingDeadlines ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                  <span className="text-sm text-blue-500">Loading...</span>
                </div>
              ) : tasksError ? (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Failed to load deadlines</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                        {upcomingDeadlinesCount}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">Due this week</p>
                    </div>
                  </div>
                  {upcomingDeadlines.length > 0 && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
                        <span className="text-xs text-gray-600 font-medium">Next: {upcomingDeadlines[0]?.due_date ? new Date(upcomingDeadlines[0].due_date).toLocaleDateString() : 'Soon'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Show message based on deadline count */}
              <div className="mt-2 pt-2 border-t border-blue-100 text-center">
                {upcomingDeadlinesCount === 0 ? (
                  <p className="text-xs text-gray-500">No upcoming deadlines</p>
                ) : (
                  <p className="text-xs text-gray-500">Tasks due within the next 7 days</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-amber-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center">
                <Bell className="h-4 w-4 mr-1.5 inline" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500 mr-2" />
                  <span className="text-sm text-amber-500">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-amber-100 rounded-lg mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-300 relative">
                      <Bell className="h-6 w-6 text-amber-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center text-[10px] text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300">{unreadCount}</span>
                      <p className="text-xs text-gray-500 mt-0.5">Unread notifications</p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                      onClick={() => window.location.href = '/notifications'}
                    >
                      <Bell className="h-3.5 w-3.5 mr-1.5" />
                      View All
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-amber-100">
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-amber-600 hover:text-amber-800"
                  onClick={() => setCreateNotificationOpen(true)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Send a notification
                </Button>
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
            <TabsTrigger value="requests" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm relative">
              <Calendar className="h-4 w-4 mr-2" />
              Leave & Overtime
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2" />
              Profile
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

              <Card className="shadow-card border border-purple-100/80 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gradient">My Tasks</CardTitle>
                    <CardDescription>View and manage your assigned tasks</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => fetchTasks()}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <div className="flex items-center bg-purple-50 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-md px-2 py-1 text-xs ${taskFilter === 'all' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'}`}
                        onClick={() => setTaskFilter('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-md px-2 py-1 text-xs ${taskFilter === 'pending' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'}`}
                        onClick={() => setTaskFilter('pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-md px-2 py-1 text-xs ${taskFilter === 'in-progress' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'}`}
                        onClick={() => setTaskFilter('in-progress')}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-md px-2 py-1 text-xs ${taskFilter === 'completed' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'}`}
                        onClick={() => setTaskFilter('completed')}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTasks ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <span className="ml-2 text-purple-500">Loading tasks...</span>
                    </div>
                  ) : tasksError ? (
                    <div className="text-center py-8 text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>{tasksError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => fetchTasks()}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No tasks found.</p>
                      {taskFilter !== 'all' && (
                        <Button
                          variant="link"
                          className="mt-2 text-purple-600"
                          onClick={() => setTaskFilter('all')}
                        >
                          View all tasks
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTasks.map(task => (
                        <div key={task.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{task.title}</h3>
                                <Badge className={`
                                  ${task.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                                  ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                  ${task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                  flex items-center gap-1
                                `}>
                                  {getStatusIcon(task.status)}
                                  <span className="capitalize">{task.status}</span>
                                </Badge>
                                <Badge className={`
                                  ${task.priority === 'low' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                                  ${task.priority === 'medium' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                                  ${task.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                `}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{task.description}</p>

                              {/* Task dates information */}
                              <div className="mt-2 space-y-1">
                                {task.due_date && (
                                  <p className="text-xs text-gray-500 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Due: {formatDate(task.due_date)}
                                  </p>
                                )}

                                {task.completed_at && task.status === 'completed' && (
                                  <p className="text-xs text-gray-500 flex items-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                    Completed: {formatDate(task.completed_at)}
                                  </p>
                                )}

                                {/* Timeliness indicator */}
                                {(() => {
                                  const timeliness = getTimelinessInfo(task);
                                  return timeliness.text ? (
                                    <p className={`text-xs italic flex items-center ${timeliness.color}`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                      {timeliness.text}
                                    </p>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="animate-slide-up">
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setCreateRequestOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Leave/Overtime Request
                </Button>
              </div>
              <MyRequests />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="animate-slide-up">
            <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30 relative backdrop-blur-sm">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-200/30 to-indigo-300/20 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-indigo-200/20 to-purple-300/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-tr from-pink-200/10 to-blue-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

              {/* Decorative top border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600"></div>

              {/* Decorative patterns */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-purple-100/50">
                <div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    Employee Profile Summary
                  </CardTitle>
                  <CardDescription className="text-gray-500">Your current status and information</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNotificationSettingsOpen(true)}
                    className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all"
                  >
                    <Settings className="h-4 w-4 mr-1.5" /> Notification Settings
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setProfileEditorOpen(true)}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Edit className="h-4 w-4 mr-1.5" /> Edit Profile
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 p-8">
                {authLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                      </div>
                    </div>
                    <span className="ml-3 text-purple-600 font-medium">Loading your profile...</span>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* Profile Avatar & Name Section */}
                    <div className="flex flex-col items-center lg:items-start">
                      <div className="relative group">
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-pulse-slow"></div>

                        {/* Static glow */}
                        <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-purple-400 to-indigo-500 opacity-50"></div>

                        {/* Avatar container */}
                        <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl border-4 border-white transform group-hover:scale-105 transition-transform duration-300">
                          {user?.full_name ? (
                            <span className="text-4xl font-bold text-white">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="h-16 w-16 text-white" />
                          )}

                          {/* Decorative ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-[1.15] opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-300"></div>
                        </div>
                      </div>

                      <div className="mt-6 text-center lg:text-left">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{user?.full_name || 'Employee'}</h3>
                        <div className="mt-3 flex flex-wrap justify-center lg:justify-start gap-2">
                          <Badge className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200 shadow-sm font-medium">
                            {user?.job_title || 'Employee'}
                          </Badge>
                          <Badge className={`px-3 py-1.5 flex items-center gap-1.5 font-medium ${user?.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            <span className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></span>
                            {user?.status || 'Active'}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-gray-500 flex items-center justify-center lg:justify-start">
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          {user?.email || 'No email provided'}
                        </p>
                      </div>
                    </div>

                    {/* Info Cards Section */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Department Card */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100/80 group hover:border-purple-200/80 transform hover:-translate-y-1">
                        <div className="flex items-start">
                          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mr-4 group-hover:bg-gradient-to-br group-hover:from-purple-200 group-hover:to-purple-300 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                            <Building className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 group-hover:text-purple-700 transition-colors">Department</h3>
                            <p className="font-medium text-gray-900 text-lg">
                              {user?.userDepartment?.name || <span className="italic text-gray-400">Not Assigned</span>}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
                                Employee ID: {user?.id ? `ID-${user.id.slice(-6).toUpperCase()}` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manager Card */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100/80 group hover:border-indigo-200/80 transform hover:-translate-y-1">
                        <div className="flex items-start">
                          <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl mr-4 group-hover:bg-gradient-to-br group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                            <User className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-700 transition-colors">Supervisor</h3>
                            <p className="font-medium text-gray-900 text-lg">
                              {user?.supervisor?.full_name || <span className="italic text-gray-400">Not Assigned</span>}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5"></span>
                                Email: {user?.supervisor?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Card */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/80 group hover:border-green-200/80 transform hover:-translate-y-1">
                        <div className="flex items-start">
                          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mr-4 group-hover:bg-gradient-to-br group-hover:from-green-200 group-hover:to-green-300 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 group-hover:text-green-700 transition-colors">Account Status</h3>
                            <div className="flex items-center">
                              <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${user?.status === 'active' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'}`}>
                                {user?.status || 'Active'}
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                                Last updated: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Joined Card */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/80 group hover:border-blue-200/80 transform hover:-translate-y-1">
                        <div className="flex items-start">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mr-4 group-hover:bg-gradient-to-br group-hover:from-blue-200 group-hover:to-blue-300 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-700 transition-colors">Joined</h3>
                            <p className="font-medium text-gray-900 text-lg">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
                                {user?.created_at ? `Member for ${Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 30))} months` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="animate-slide-up">
            <Card className="shadow-card border border-purple-100/80 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-gradient">Profile Details</CardTitle>
                <CardDescription>Your complete profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <User className="h-16 w-16 text-white" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-2xl font-bold">{user?.full_name || 'Employee'}</h2>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          {user?.role || 'Employee'}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {user?.job_title || 'Employee'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {user?.status || 'Active'}
                        </Badge>
                      </div>
                      <p className="text-gray-500">{user?.email || 'No email provided'}</p>
                      <Button
                        size="sm"
                        onClick={() => setProfileEditorOpen(true)}
                        className="mt-2"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Department Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Department</dt>
                            <dd>{user?.userDepartment?.name || 'Not Assigned'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Supervisor</dt>
                            <dd>{user?.supervisor?.full_name || 'Not Assigned'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Supervisor Email</dt>
                            <dd>{user?.supervisor?.email || 'N/A'}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Account Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                            <dd>{user?.id ? `ID-${user.id.slice(-6).toUpperCase()}` : 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                            <dd className="flex items-center">
                              <span className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></span>
                              {user?.status || 'Active'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                            <dd>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
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

      {/* Leave and Overtime Request Dialog */}
      <Dialog open={createRequestOpen} onOpenChange={setCreateRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit a New Request</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit a leave or overtime request.
            </DialogDescription>
          </DialogHeader>
          <RequestForm
            onSuccess={() => {
              setCreateRequestOpen(false);
              toast({
                title: "Request Submitted",
                description: "Your request has been submitted successfully.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add some CSS for the enhanced cards
const styles = `
.card-gradient {
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.04);
}

.shadow-card {
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.05), 0 1px 2px rgba(124, 58, 237, 0.1);
}

.text-gradient {
  background: linear-gradient(to right, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.animate-slide-up {
  animation: slideUp 0.5s ease forwards;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}

.animate-delay-100 {
  animation-delay: 0.1s;
}

.animate-delay-200 {
  animation-delay: 0.2s;
}

.animate-delay-300 {
  animation-delay: 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default EmployeeDashboard;
