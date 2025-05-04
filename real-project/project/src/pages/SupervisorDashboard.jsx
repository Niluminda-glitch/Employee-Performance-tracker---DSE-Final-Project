
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, ClipboardList, Calendar as CalendarIcon, Check, Clock, AlertCircle,
  ThumbsUp, ThumbsDown, FileText, Download, RefreshCw, Building,
  Mail, Briefcase, UserCheck, Plus, ArrowRightCircle, CheckCircle2, UserPlus, Send, Bell
} from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateNotificationModal from "@/components/notifications/CreateNotificationModal";
import TeamRequests from "@/components/requests/TeamRequests";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Form Handling & Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, api, isLoading: authLoading } = useAuth(); // Get user info and api instance

  // State for team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState(null);

  // Fetch team members
  useEffect(() => {
    // Ensure user is loaded, authenticated, and is a supervisor/manager
    if (!authLoading && user?.id && api && (user.role === 'supervisor' || user.role === 'manager')) {
      const fetchTeam = async () => {
        setIsLoadingTeam(true);
        setTeamError(null);
        console.log(`[SupervisorDashboard] Fetching team using GET /supervisor/team`);

        try {
          // Check if api is a valid axios instance
          if (typeof api.get !== 'function') {
            console.error('[SupervisorDashboard] Error: api.get is not a function. API object:', api);
            setTeamError('API client not properly initialized. Please try logging out and back in.');
            setTeamMembers([]);
            setIsLoadingTeam(false);
            return;
          }

          // Use the 'api' instance from context - token is attached automatically
          const response = await api.get('/supervisor/team');
          setTeamMembers(response.data || []);
          console.log(`[SupervisorDashboard] Fetched ${response.data?.length} team members.`);

          // Log the first team member for debugging
          if (response.data && response.data.length > 0) {
            console.log('[SupervisorDashboard] First team member example:', response.data[0]);
          }
        } catch (err) {
          console.error('[SupervisorDashboard] Error fetching team:', err.response?.data || err.message);
          setTeamError(err.response?.data?.message || 'Failed to load team members.');
          setTeamMembers([]); // Clear data on error
        } finally {
          setIsLoadingTeam(false);
        }
      };
      fetchTeam();
    }
  }, [user, api, authLoading]);

  // State for team tasks
  const [teamTasks, setTeamTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // State for new task form
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [assignTaskError, setAssignTaskError] = useState(null);

  // State for notification modal
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);

  // --- Form Schema Definition (using Zod) ---
  const taskFormSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().max(500, {message: "Description too long"}).optional().or(z.literal('')), // Allow empty string or optional
    assignee_id: z.string().uuid({ message: "Please select a valid team member." }), // Expecting UUID string
    priority: z.enum(["low", "medium", "high"], { required_error: "Priority is required."}),
    due_date: z.date().optional().nullable(), // Allow date to be optional/null
  });

  // --- React Hook Form Initialization ---
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { // Set initial form values
      title: "",
      description: "",
      assignee_id: null, // Start with null instead of empty string
      priority: "medium", // Default priority
      due_date: null, // Start with no date selected
    },
  });

  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, type: "Leave", employee: "Jamie Chen", dates: "May 2-5, 2025", reason: "Family event", status: "pending" },
    { id: 2, type: "Overtime", employee: "Alex Kim", dates: "April 22, 2025", hours: 3, reason: "Project deadline", status: "pending" },
  ]);

  // Performance metrics data
  const performanceData = {
    completionRate: "92%",
    responseTime: "1.2 days",
    teamRating: "4.7/5",
    tasksCompleted: 28,
    tasksInProgress: 5,
    tasksPending: 3
  };

  // Handler for approving requests
  const handleApproveRequest = (requestId) => {
    setPendingRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: "approved" }
          : request
      )
    );
    toast({
      title: "Request Approved",
      description: "The request has been successfully approved.",
      variant: "success",
    });
  };

  // Handler for rejecting requests
  const handleRejectRequest = (requestId) => {
    setPendingRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: "rejected" }
          : request
      )
    );
    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
      variant: "destructive",
    });
  };

  // Fetch team tasks
  const fetchTeamTasks = useCallback(async () => {
    if (!authLoading && user?.id && api && (user.role === 'supervisor' || user.role === 'manager')) {
      setIsLoadingTasks(true);
      setTasksError(null);
      console.log(`[SupervisorDashboard] Fetching team tasks using GET /tasks/team`);

      try {
        const response = await api.get('/tasks/team');
        setTeamTasks(response.data || []);
        console.log(`[SupervisorDashboard] Fetched ${response.data?.length} team tasks.`);
      } catch (err) {
        console.error('[SupervisorDashboard] Error fetching team tasks:', err.response?.data || err.message);
        setTasksError(err.response?.data?.message || 'Failed to load team tasks.');
        setTeamTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    }
  }, [user, api, authLoading]);

  // Load tasks when component mounts
  useEffect(() => {
    if (!authLoading && user?.id && api) {
      fetchTeamTasks();
    }
  }, [fetchTeamTasks, authLoading, user, api]);

  // Handler for updating task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!api) return;

    console.log(`[SupervisorDashboard] Updating task ${taskId} status to ${newStatus}`);
    setUpdatingTaskId(taskId);
    setTasksError(null);

    try {
      // Use PUT request to the specific task status endpoint
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });

      // Update local state for immediate feedback
      setTeamTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Task Updated",
        description: `Task status set to ${newStatus}.`,
        variant: "default",
      });

    } catch (err) {
      console.error(`[SupervisorDashboard] Failed to update task ${taskId} status:`, err.response?.data || err.message);
      setTasksError(err.response?.data?.message || 'Failed to update task status.');
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || 'Could not update task status.',
        variant: "destructive"
      });
      // Refresh tasks on error to ensure consistency
      fetchTeamTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // --- Form Submission Handler ---
  const onAssignTaskSubmit = async (values) => {
    if (!api) return; // Ensure api instance is available
    setIsSubmittingTask(true);
    setAssignTaskError(null);
    console.log("[SupervisorDashboard] Assigning new task with values:", values);

    try {
      // Format data for the API: Date needs specific format, ensure assignee_id is correct
      const dataToSend = {
        ...values,
        // Format date to 'YYYY-MM-DD' string if selected, otherwise send null
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
      };
      console.log("[SupervisorDashboard] Data being sent to POST /tasks:", dataToSend);

      // Call the backend API using the 'api' instance from context
      await api.post('/tasks', dataToSend);

      toast({
        title: "Task Assigned",
        description: `Task "${values.title}" assigned successfully.`,
        variant: "default"
      });
      setIsAssignTaskOpen(false); // Close dialog
      form.reset(); // Reset form to default values
      fetchTeamTasks(); // Refresh the task list to show the new task

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assign task.';
      console.error('[SupervisorDashboard] Error assigning task:', errorMsg, err.response);
      setAssignTaskError(errorMsg); // Display error within the modal
    } finally {
      setIsSubmittingTask(false); // Re-enable submit button
    }
  };

  // --- Reset form when dialog closes ---
  useEffect(() => {
    if (!isAssignTaskOpen) {
      form.reset(); // Reset form fields
      setAssignTaskError(null); // Clear any previous submission errors
    }
  }, [isAssignTaskOpen, form]); // Depend on dialog state

  // Handler for generating reports
  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Team performance report has been generated.",
      variant: "default",
    });
  };

  // Handler for downloading PDF
  const handleDownloadPDF = () => {
    toast({
      title: "Downloading PDF",
      description: "Your report is being downloaded as PDF.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation userRole="supervisor" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
          <div className="mt-4 md:mt-0 flex space-x-2">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingTeam ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-500"></div>
                  ) : (
                    teamMembers.length
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Direct reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingTasks ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-500"></div>
                  ) : (
                    teamTasks.length
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {!isLoadingTasks ? `${teamTasks.filter(t => t.status === 'pending').length} pending tasks` : 'Loading...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{pendingRequests.filter(req => req.status === "pending").length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="team" className="mb-8">
          <TabsList>
            <TabsTrigger value="team">My Team</TabsTrigger>
            <TabsTrigger value="tasks">Team Tasks</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Team Members</CardTitle>
                  <CardDescription>View and manage your direct reports</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Refresh team members
                      if (!authLoading && user?.id && api && (user.role === 'supervisor' || user.role === 'manager')) {
                        setIsLoadingTeam(true);
                        setTeamError(null);
                        api.get('/supervisor/team')
                          .then(response => {
                            setTeamMembers(response.data || []);
                            toast({
                              title: "Team Refreshed",
                              description: `${response.data?.length || 0} team members loaded.`,
                              variant: "default"
                            });
                          })
                          .catch(err => {
                            setTeamError(err.response?.data?.message || 'Failed to refresh team members.');
                            toast({
                              title: "Refresh Failed",
                              description: err.response?.data?.message || 'Failed to refresh team members.',
                              variant: "destructive"
                            });
                          })
                          .finally(() => {
                            setIsLoadingTeam(false);
                          });
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast({
                      title: "Team Management",
                      description: "Full team management would be available here.",
                    })}
                  >
                    Manage Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <p className="font-medium">Error loading team members</p>
                    <p className="text-sm">{teamError}</p>
                  </div>
                )}

                {isLoadingTeam ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-purple-700">Loading team members...</span>
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
                                {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              {member.full_name || 'Unnamed User'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                {member.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.job_title ? (
                                <div className="flex items-center">
                                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                  {member.job_title}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not specified</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {member.userDepartment ? (
                                <div className="flex items-center">
                                  <Building className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                  {member.userDepartment.name}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.status === 'active' ? 'bg-green-100 text-green-800' :
                                member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800' // For first_login or other statuses
                              }`}>
                                {member.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => toast({
                                    title: "View Profile",
                                    description: `Viewing profile for ${member.full_name || member.email}`,
                                  })}
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" /> View Profile
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    // Filter tasks for this team member
                                    const memberTasks = teamTasks.filter(task => task.assignee_id === member.id);
                                    toast({
                                      title: `${member.full_name || member.email}'s Tasks`,
                                      description: `${memberTasks.length} tasks assigned (${memberTasks.filter(t => t.status === 'completed').length} completed)`,
                                    });
                                  }}
                                >
                                  <ClipboardList className="h-3.5 w-3.5 mr-1" /> View Tasks
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You currently have no team members assigned to you in the system.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Tasks</CardTitle>
                  <CardDescription>Manage your team's assignments</CardDescription>
                </div>
                <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={isLoadingTeam}>
                      <UserPlus className="h-4 w-4 mr-2" /> Assign New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Assign New Task</DialogTitle>
                      <DialogDescription>Fill in the details and assign to a team member.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}> {/* Form Provider */}
                      <form onSubmit={form.handleSubmit(onAssignTaskSubmit)} className="space-y-4 py-2">
                        {/* Title Field */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Complete quarterly report" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        {/* Description Field */}
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Add details, instructions, or notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        {/* Assignee Field */}
                        <FormField control={form.control} name="assignee_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign To *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || null}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers.length > 0 ? teamMembers.map(member => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.full_name || member.email} {member.job_title ? `(${member.job_title})` : ''}
                                  </SelectItem>
                                )) : <SelectItem value="no-members" disabled>No team members loaded</SelectItem>}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        {/* Priority Field */}
                        <FormField control={form.control} name="priority" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "medium"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        {/* Due Date Field */}
                        <FormField control={form.control} name="due_date" render={({ field }) => (
                          <FormItem className="flex flex-col pt-1">
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}/>

                        {/* Display API Error */}
                        {assignTaskError && <p className="text-sm font-medium text-destructive">{assignTaskError}</p>}

                        {/* Footer with Buttons */}
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAssignTaskOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={isSubmittingTask}>
                            {isSubmittingTask ? "Assigning..." : "Assign Task"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form> {/* End Form Provider */}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tasksError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <p className="font-medium">Error loading team tasks</p>
                    <p className="text-sm">{tasksError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs border-red-200 text-red-700 hover:bg-red-50"
                      onClick={fetchTeamTasks}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {isLoadingTasks ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-purple-700">Loading team tasks...</span>
                  </div>
                ) : teamTasks.length === 0 && !tasksError ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <ClipboardList className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't assigned any tasks to your team yet.
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => setIsAssignTaskOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamTasks.map(task => (
                      <div key={task.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm">Assigned to: <span className="font-medium">
                              {task.assignee?.full_name || (task.assignee_id ? 'Loading...' : 'Unassigned')}
                            </span></p>
                            <p className="text-sm text-muted-foreground">
                              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{task.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {task.status === 'pending' && (
                              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Pending
                              </span>
                            )}
                            {task.status === 'in-progress' && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> In Progress
                              </span>
                            )}
                            {task.status === 'completed' && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Completed
                              </span>
                            )}

                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </span>

                            <div className="flex gap-2 mt-2">
                              {task.status !== 'in-progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                                  disabled={updatingTaskId === task.id}
                                >
                                  <ArrowRightCircle className="h-3 w-3 mr-1" /> Mark In Progress
                                </Button>
                              )}

                              {task.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-green-600"
                                  onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                                  disabled={updatingTaskId === task.id}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Complete
                                </Button>
                              )}

                              {task.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-amber-600"
                                  onClick={() => handleUpdateTaskStatus(task.id, "pending")}
                                  disabled={updatingTaskId === task.id}
                                >
                                  <ArrowRightCircle className="h-3 w-3 mr-1" /> Reopen
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <TeamRequests />
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Overview of team productivity and metrics</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/analytics')}
                  >
                    <FileText className="h-4 w-4 mr-1" /> View Full Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <FileText className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Advanced Analytics Available</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    View detailed performance metrics, team comparisons, and individual employee analytics in our comprehensive analytics dashboard.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => navigate('/analytics')}
                  >
                    Go to Analytics Dashboard
                  </Button>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-md font-medium mb-3">Quick Task Status Overview</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Completed</TableCell>
                        <TableCell>{performanceData.tasksCompleted}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">In Progress</TableCell>
                        <TableCell>{performanceData.tasksInProgress}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "14%" }}></div>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pending</TableCell>
                        <TableCell>{performanceData.tasksPending}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "8%" }}></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <h3 className="text-lg font-bold text-green-600">{performanceData.completionRate}</h3>
                    <p className="text-sm text-muted-foreground">Task Completion Rate</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <h3 className="text-lg font-bold text-amber-600">{performanceData.responseTime}</h3>
                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <h3 className="text-lg font-bold text-blue-600">{performanceData.teamRating}</h3>
                    <p className="text-sm text-muted-foreground">Team Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Notification Modal */}
      <CreateNotificationModal
        open={createNotificationOpen}
        onOpenChange={setCreateNotificationOpen}
      />
    </div>
  );
};

export default SupervisorDashboard;
