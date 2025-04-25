
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Calendar, Bell, Check, Clock, AlertCircle, LayoutDashboard, User, Settings, Edit, ArrowUpCircle, CheckCircle2, Coffee, MoreHorizontal, Tag, ListFilter } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import { useToast } from "@/hooks/use-toast";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import ProfileEditor from "@/components/profile/ProfileEditor";
import ActiveTaskAssistant from "@/components/tasks/ActiveTaskAssistant";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const EmployeeDashboard = () => {
  const { toast } = useToast();
  // State for modals
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'

  // Mock data - would come from API in real implementation
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete weekly report", status: "pending", dueDate: "2025-04-20", priority: "high" },
    { id: 2, title: "Team meeting preparation", status: "in-progress", dueDate: "2025-04-18", priority: "medium" },
    { id: 3, title: "Update personal skills list", status: "completed", dueDate: "2025-04-15", priority: "low" },
    { id: 4, title: "Code review for API endpoint", status: "pending", dueDate: "2025-04-21", priority: "high" },
    { id: 5, title: "Create presentation slides", status: "in-progress", dueDate: "2025-04-19", priority: "medium" },
  ]);

  const announcements = [
    { id: 1, title: "New leave policy", date: "2025-04-15", content: "Please review the updated leave policy." },
    { id: 2, title: "Team building event", date: "2025-04-30", content: "Join us for an online team building session." },
  ];

  // Handler for updating task status
  const handleUpdateTaskStatus = (taskId, newStatus) => {
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

  const { user } = useAuth();

  return (
    <DashboardShell
      title="Employee Dashboard"
      subtitle="Welcome back! Here's an overview of your tasks and activities."
    >

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <ClipboardList className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{tasks.length}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 font-medium rounded-full">
                  {tasks.filter(task => task.status !== "completed").length} pending
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                  style={{
                    width: `${(tasks.filter(task => task.status === "completed").length / tasks.length) * 100}%`
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">2</span>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-medium rounded-full">
                  This week
                </span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${i < 2 ? 'bg-blue-400' : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-card card-hover overflow-hidden border-0 animate-slide-up animate-delay-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg mr-3">
                    <Bell className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{announcements.length}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 font-medium rounded-full">
                  New updates
                </span>
              </div>
              <div className="mt-4 flex space-x-1">
                {announcements.map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 bg-amber-400 rounded-full"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="mb-8 animate-fade-in">
          <TabsList className="p-1 bg-purple-50 rounded-xl border border-purple-100 mb-6">
            <TabsTrigger value="overview" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="work" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4 mr-2" />
              Work
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              Announcements
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
                  <ActiveTaskAssistant />
                </CardContent>
              </Card>
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
              <CardContent className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-8 pt-4">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto md:mx-0">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <div className="mt-4 text-center md:text-left">
                      <h3 className="font-semibold text-lg">Alex Employee</h3>
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mt-1">
                        Software Engineer
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Department</h3>
                      <p className="font-medium">Engineering</p>
                      <div className="mt-auto pt-2">
                        <span className="text-xs text-gray-500">Team size: 12 members</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Manager</h3>
                      <p className="font-medium">John Smith</p>
                      <div className="mt-auto pt-2">
                        <span className="text-xs text-gray-500">Direct reports: 5</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Status</h3>
                      <p className="text-green-600 flex items-center font-medium">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        Active
                      </p>
                      <div className="mt-auto pt-2">
                        <span className="text-xs text-gray-500">Since: April 15, 2025</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100/50 flex flex-col">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Experience</h3>
                      <p className="font-medium">2 years</p>
                      <div className="mt-auto pt-2">
                        <span className="text-xs text-gray-500">Joined: Jan 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                {getFilteredTasks().length === 0 ? (
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
                                <span>Due: {task.dueDate}</span>
                              </div>
                            </div>

                            <div className="ml-4 flex-shrink-0">
                              <div className="flex space-x-2">
                                {/* Always show the appropriate action button based on task status */}
                                {task.status === 'pending' && (
                                  <Button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                  >
                                    <ArrowUpCircle className="h-4 w-4 mr-1" />
                                    Start Task
                                  </Button>
                                )}

                                {task.status === 'in-progress' && (
                                  <Button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Complete Task
                                  </Button>
                                )}

                                {task.status === 'completed' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                  >
                                    <ArrowUpCircle className="h-4 w-4 mr-1" />
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
                  <CardTitle className="text-xl text-gradient">Company Announcements</CardTitle>
                  <CardDescription>Latest news and updates from the company</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Bell className="h-4 w-4 mr-2" />
                  All Updates
                </Button>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <div className="space-y-6">
                  {announcements.map((announcement, index) => (
                    <div
                      key={announcement.id}
                      className="relative border border-purple-100 hover:border-purple-300 rounded-xl p-5 pl-7 transition-all bg-white hover:shadow-md hover:-translate-y-0.5 duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 100 + 100}ms` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-xl"></div>
                      <h3 className="font-medium text-lg mb-2 text-gray-800">{announcement.title}</h3>
                      <div className="flex items-center mb-3">
                        <Calendar className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <p className="text-xs text-amber-600 font-medium">Posted on: {announcement.date}</p>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                        {announcement.content}
                      </p>
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 -mr-2"
                          onClick={() => toast({
                            title: "Reading Announcement",
                            description: "Full announcement details would be shown here.",
                          })}
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Modal components */}
      <NotificationSettings
        open={notificationSettingsOpen}
        onOpenChange={setNotificationSettingsOpen}
      />

      <ProfileEditor
        open={profileEditorOpen}
        onOpenChange={setProfileEditorOpen}
      />
    </DashboardShell>
  );
};

export default EmployeeDashboard;
