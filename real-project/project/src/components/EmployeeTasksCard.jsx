import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  Check, 
  Calendar, 
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  ArrowRightCircle
} from 'lucide-react';

const EmployeeTasksCard = ({ open, onOpenChange, employeeId, employeeName }) => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Fetch tasks for the employee
  useEffect(() => {
    if (open && employeeId && api) {
      fetchEmployeeTasks();
    }
  }, [open, employeeId, api]);

  const fetchEmployeeTasks = async () => {
    setIsLoading(true);
    setError(null);
    console.log(`[EmployeeTasksCard] Fetching tasks for employee ID: ${employeeId}`);

    try {
      // First try the dedicated endpoint if it exists
      try {
        const response = await api.get(`/tasks/user/${employeeId}`);
        setTasks(response.data || []);
        console.log(`[EmployeeTasksCard] Fetched ${response.data?.length} tasks for employee`);
        setIsLoading(false);
        return;
      } catch (endpointError) {
        console.log('[EmployeeTasksCard] Dedicated endpoint not available, falling back to team tasks filtering');
        // If dedicated endpoint fails, fall back to filtering team tasks
      }

      // Fallback: Get all team tasks and filter for this employee
      const response = await api.get('/tasks/team');
      const employeeTasks = response.data.filter(task => task.assignee_id === employeeId);
      setTasks(employeeTasks || []);
      console.log(`[EmployeeTasksCard] Filtered ${employeeTasks.length} tasks for employee from team tasks`);
    } catch (err) {
      console.error('[EmployeeTasksCard] Error fetching tasks:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load tasks for this employee.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task status update
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!api) return;

    console.log(`[EmployeeTasksCard] Updating task ${taskId} status to ${newStatus}`);
    setUpdatingTaskId(taskId);

    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });

      // Update local state
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('[EmployeeTasksCard] Error updating task status:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update task status.');
      // Refresh tasks to ensure consistency
      fetchEmployeeTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3" /> High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <ArrowRightCircle className="h-3 w-3" /> Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <ArrowDownCircle className="h-3 w-3" /> Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {priority}
          </Badge>
        );
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-500" />
            {employeeName ? `${employeeName}'s Tasks` : 'Employee Tasks'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
            <span className="ml-2 text-purple-700">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error loading tasks</p>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs border-red-200 text-red-700 hover:bg-red-50"
              onClick={fetchEmployeeTasks}
            >
              Try Again
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              This employee currently has no assigned tasks.
            </p>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tasks.map(task => (
              <motion.div 
                key={task.id} 
                className="border rounded-lg p-4 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
                variants={itemVariants}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                      
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(task.due_date)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  {task.status !== 'in-progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                      disabled={updatingTaskId === task.id}
                    >
                      <Clock className="h-3 w-3 mr-1" /> Mark In Progress
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
              </motion.div>
            ))}
          </motion.div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeTasksCard;
