import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ClipboardList, Plus, Search, Check, Clock, AlertCircle, UserPlus, Calendar, Filter } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
const TeamTasks = () => {
  const {
    user
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });

  // Mock data - would come from API in real implementation
  const [tasks, setTasks] = useState([{
    id: 1,
    title: "Complete project documentation",
    description: "Finalize all documentation for the current production run",
    assignee: "Alex Kim",
    status: "pending",
    dueDate: "2025-04-25",
    priority: "high",
    assigneeId: 101
  }, {
    id: 2,
    title: "QA testing for new feature",
    description: "Conduct quality assurance testing on the new automated cutting feature",
    assignee: "Jamie Chen",
    status: "in-progress",
    dueDate: "2025-04-20",
    priority: "high",
    assigneeId: 102
  }, {
    id: 3,
    title: "Update API documentation",
    description: "Review and update all API documentation for the inventory system",
    assignee: "Taylor Singh",
    status: "completed",
    dueDate: "2025-04-15",
    priority: "medium",
    assigneeId: 103
  }, {
    id: 4,
    title: "Weekly production report",
    description: "Compile and submit the weekly production metrics",
    assignee: "Alex Kim",
    status: "in-progress",
    dueDate: "2025-04-18",
    priority: "medium",
    assigneeId: 101
  }, {
    id: 5,
    title: "Equipment maintenance check",
    description: "Perform routine maintenance check on all sewing machines",
    assignee: "Jordan Lee",
    status: "pending",
    dueDate: "2025-04-22",
    priority: "low",
    assigneeId: 104
  }]);

  // Team members for assignment
  const teamMembers = [{
    id: 101,
    name: "Alex Kim",
    role: "Senior Seamster",
    workload: "Medium"
  }, {
    id: 102,
    name: "Jamie Chen",
    role: "Quality Inspector",
    workload: "High"
  }, {
    id: 103,
    name: "Taylor Singh",
    role: "Pattern Designer",
    workload: "Low"
  }, {
    id: 104,
    name: "Jordan Lee",
    role: "Machine Operator",
    workload: "Medium"
  }, {
    id: 105,
    name: "Casey Johnson",
    role: "Junior Seamster",
    workload: "Low"
  }];

  // Add new task
  const handleAddTask = () => {
    // Validate form
    if (!newTask.title || !newTask.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Add new task to list
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    setTasks([...tasks, {
      id: newId,
      title: newTask.title,
      description: newTask.description,
      assignee: "",
      status: "pending",
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      assigneeId: null
    }]);

    // Reset form and close dialog
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: ""
    });
    setIsAddTaskOpen(false);
    toast.success("New task created successfully");
  };

  // Assign task to team member
  const handleAssignTask = teamMemberId => {
    if (!selectedTask || !teamMemberId) return;
    const teamMember = teamMembers.find(m => m.id === teamMemberId);
    setTasks(tasks.map(task => task.id === selectedTask.id ? {
      ...task,
      assignee: teamMember.name,
      assigneeId: teamMember.id
    } : task));
    setIsAssignTaskOpen(false);
    setSelectedTask(null);
    toast.success(`Task assigned to ${teamMember.name}`);
  };

  // Update task status
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => task.id === taskId ? {
      ...task,
      status: newStatus
    } : task));
    toast.success(`Task status updated to ${newStatus}`);
  };

  // Filter tasks based on search term and status filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()) || task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === "pending");
  const inProgressTasks = filteredTasks.filter(task => task.status === "in-progress");
  const completedTasks = filteredTasks.filter(task => task.status === "completed");
  return <div className="min-h-screen bg-gray-50">
      <TopNavigation userRole={user?.role || "supervisor"} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Team Tasks</h1>
            <p className="text-muted-foreground">
              Manage and assign tasks to your team
            </p>
          </div>
          
          <Button onClick={() => setIsAddTaskOpen(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks by title, description or assignee..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {/* Task Management Tabs */}
        <Tabs defaultValue="all" className="w-full">
          
          
          {/* All Tasks */}
          <TabsContent value="all">
            <TaskList tasks={filteredTasks} updateTaskStatus={updateTaskStatus} onAssign={task => {
            setSelectedTask(task);
            setIsAssignTaskOpen(true);
          }} />
          </TabsContent>
          
          {/* Pending Tasks */}
          <TabsContent value="pending">
            <TaskList tasks={pendingTasks} updateTaskStatus={updateTaskStatus} onAssign={task => {
            setSelectedTask(task);
            setIsAssignTaskOpen(true);
          }} />
          </TabsContent>
          
          {/* In Progress Tasks */}
          <TabsContent value="in-progress">
            <TaskList tasks={inProgressTasks} updateTaskStatus={updateTaskStatus} onAssign={task => {
            setSelectedTask(task);
            setIsAssignTaskOpen(true);
          }} />
          </TabsContent>
          
          {/* Completed Tasks */}
          <TabsContent value="completed">
            <TaskList tasks={completedTasks} updateTaskStatus={updateTaskStatus} onAssign={task => {
            setSelectedTask(task);
            setIsAssignTaskOpen(true);
          }} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task for your team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
              <Input id="title" value={newTask.title} onChange={e => setNewTask({
              ...newTask,
              title: e.target.value
            })} placeholder="Enter task title" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" rows={3} value={newTask.description} onChange={e => setNewTask({
              ...newTask,
              description: e.target.value
            })} placeholder="Enter task description" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" value={newTask.priority} onChange={e => setNewTask({
                ...newTask,
                priority: e.target.value
              })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
                <Input id="dueDate" type="date" value={newTask.dueDate} onChange={e => setNewTask({
                ...newTask,
                dueDate: e.target.value
              })} />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Task Dialog */}
      <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              {selectedTask && <>Assign "{selectedTask.title}" to a team member</>}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {teamMembers.map(member => <div key={member.id} onClick={() => handleAssignTask(member.id)} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                
                <div>
                  <Badge workload={member.workload} />
                </div>
              </div>)}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignTaskOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

// Task List Component
const TaskList = ({
  tasks,
  updateTaskStatus,
  onAssign
}) => {
  if (tasks.length === 0) {
    return <div className="text-center py-12 border rounded-lg bg-gray-50">
        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-muted-foreground">No tasks found</p>
      </div>;
  }
  return <div className="space-y-4">
      {tasks.map(task => <TaskCard key={task.id} task={task} updateTaskStatus={updateTaskStatus} onAssign={() => onAssign(task)} />)}
    </div>;
};

// Task Card Component
const TaskCard = ({
  task,
  updateTaskStatus,
  onAssign
}) => {
  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start">
              <div className="mr-4">
                {task.status === 'pending' && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                  </span>}
                {task.status === 'in-progress' && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-4 w-4 text-blue-700" />
                  </span>}
                {task.status === 'completed' && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-700" />
                  </span>}
              </div>
              
              <div>
                <h3 className="font-medium text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                  
                  {task.assignee ? <div className="flex items-center text-sm">
                      <span className="font-medium">Assigned to: </span>
                      <span className="ml-1">{task.assignee}</span>
                    </div> : <div className="flex items-center text-sm text-amber-600">
                      <span>Not assigned</span>
                    </div>}
                  
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end">
            {!task.assignee && <Button variant="outline" size="sm" onClick={onAssign}>
                <UserPlus className="h-4 w-4 mr-1" />
                Assign
              </Button>}
            
            {task.status === 'pending' && <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, 'in-progress')} className="border-blue-200 text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                <Clock className="h-4 w-4 mr-1" />
                Start Task
              </Button>}
            
            {task.status === 'in-progress' && <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, 'completed')} className="border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50">
                <Check className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>}
            
            {task.status === 'completed' && <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, 'in-progress')} className="border-blue-200 text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                <Clock className="h-4 w-4 mr-1" />
                Reopen
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
};

// Priority Badge Component
const PriorityBadge = ({
  priority
}) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  if (priority === 'high') {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (priority === 'medium') {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
  } else if (priority === 'low') {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </span>;
};

// Workload Badge Component
const Badge = ({
  workload
}) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  if (workload === 'High') {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (workload === 'Medium') {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
  } else if (workload === 'Low') {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {workload} Workload
    </span>;
};
export default TeamTasks;