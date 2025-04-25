
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, ClipboardList, Calendar, Check, Clock, AlertCircle,
  ThumbsUp, ThumbsDown, FileText, Download, ArrowUpCircle
} from "lucide-react";
import TopNavigation from "@/components/layout/TopNavigation";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SupervisorDashboard = () => {
  const { toast } = useToast();
  // Mock data - would come from API in real implementation
  const [teamTasks, setTeamTasks] = useState([
    { id: 1, title: "Complete project documentation", assignee: "Alex Kim", status: "pending", dueDate: "2025-04-25", priority: "high" },
    { id: 2, title: "QA testing for new feature", assignee: "Jamie Chen", status: "in-progress", dueDate: "2025-04-20", priority: "high" },
    { id: 3, title: "Update API documentation", assignee: "Taylor Singh", status: "completed", dueDate: "2025-04-15", priority: "medium" },
  ]);

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

  // Handler for updating task status
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTeamTasks(prev =>
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
        <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">5</span>
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
                <span className="text-2xl font-bold">{teamTasks.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">2 pending tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{pendingRequests.filter(req => req.status === "pending").length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="tasks" className="mb-8">
          <TabsList>
            <TabsTrigger value="tasks">Team Tasks</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Tasks</CardTitle>
                  <CardDescription>Manage your team's assignments</CardDescription>
                </div>
                <Button size="sm" onClick={() => toast({
                  title: "New Task",
                  description: "Task assignment form would open here.",
                })}>
                  Assign New Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamTasks.map(task => (
                    <div key={task.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm">Assigned to: <span className="font-medium">{task.assignee}</span></p>
                          <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
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

                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                              disabled={task.status === "in-progress"}
                            >
                              <Clock className="h-3 w-3 mr-1" /> Mark In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-green-600"
                              onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                              disabled={task.status === "completed"}
                            >
                              <Check className="h-3 w-3 mr-1" /> Mark Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval Requests</CardTitle>
                <CardDescription>Review and approve team member requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.type} Request - {request.employee}</h3>
                          <p className="text-sm">{request.dates}</p>
                          <p className="text-sm text-muted-foreground">Reason: {request.reason}</p>
                          {request.hours && <p className="text-sm">Hours: {request.hours}</p>}

                          {request.status === "approved" && (
                            <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                              Approved
                            </span>
                          )}

                          {request.status === "rejected" && (
                            <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                              Rejected
                            </span>
                          )}
                        </div>
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                    onClick={handleGenerateReport}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Generate Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md mb-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Performance chart would display here</p>
                    <p className="text-xs text-muted-foreground">(Placeholder for actual chart component)</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Task Status Overview</h3>
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
    </div>
  );
};

export default SupervisorDashboard;
