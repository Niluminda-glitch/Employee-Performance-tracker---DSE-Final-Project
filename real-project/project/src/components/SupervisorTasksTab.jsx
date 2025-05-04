import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    CheckCircle2,
    ArrowRightCircle,
    Plus,
    User,
    AlertTriangle
} from 'lucide-react';
import { getTimelinessInfo, formatDate } from '../lib/taskUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function SupervisorTasksTab({ teamMembers }) {
    const { user, api } = useAuth();

    // State for team tasks
    const [teamTasks, setTeamTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [tasksError, setTasksError] = useState(null);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    // State for new task form
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee_id: '',
        priority: 'medium',
        due_date: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fetch team tasks
    const fetchTeamTasks = useCallback(async () => {
        if (!user?.id || !api) return;

        console.log('[SupervisorTasksTab] Fetching team tasks');
        setIsLoadingTasks(true);
        setTasksError(null);

        try {
            const response = await api.get('/tasks/team');
            setTeamTasks(response.data || []);
            console.log('[SupervisorTasksTab] Team tasks fetched:', response.data);
        } catch (err) {
            console.error('[SupervisorTasksTab] Failed to fetch team tasks:', err.response?.data || err.message);
            setTasksError(err.response?.data?.message || 'Failed to load team tasks.');
            setTeamTasks([]);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [user?.id, api]);

    // Fetch tasks on mount
    useEffect(() => {
        if (user?.id && api) {
            fetchTeamTasks();
        }
    }, [user?.id, api, fetchTeamTasks]);

    // Handle task status update
    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        if (!user?.id || !api) return;

        console.log(`[SupervisorTasksTab] Updating task ${taskId} status to ${newStatus}`);
        setUpdatingTaskId(taskId);
        setTasksError(null);

        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });

            // Update state locally
            setTeamTasks(currentTasks =>
                currentTasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
            console.log(`[SupervisorTasksTab] Task ${taskId} status updated to ${newStatus}`);
        } catch (err) {
            console.error(`[SupervisorTasksTab] Failed to update task status:`, err.response?.data || err.message);
            setTasksError(err.response?.data?.message || 'Failed to update task status.');
            // Refresh tasks to ensure consistency
            fetchTeamTasks();
        } finally {
            setUpdatingTaskId(null);
        }
    };

    // Handle new task form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    // Handle select change (for dropdown fields)
    const handleSelectChange = (name, value) => {
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmitNewTask = async (e) => {
        e.preventDefault();
        if (!user?.id || !api) return;

        // Validate form
        if (!newTask.title || !newTask.assignee_id) {
            setFormError('Title and assignee are required.');
            return;
        }

        console.log('[SupervisorTasksTab] Creating new task:', newTask);
        setIsSubmitting(true);
        setFormError(null);

        try {
            const response = await api.post('/tasks', newTask);
            console.log('[SupervisorTasksTab] Task created:', response.data);

            // Reset form and close dialog
            setNewTask({
                title: '',
                description: '',
                assignee_id: '',
                priority: 'medium',
                due_date: ''
            });
            setIsDialogOpen(false);

            // Refresh tasks
            fetchTeamTasks();
        } catch (err) {
            console.error('[SupervisorTasksTab] Failed to create task:', err.response?.data || err.message);
            setFormError(err.response?.data?.message || 'Failed to create task.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to get priority badge color
    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Team Tasks</h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Assign New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign New Task</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmitNewTask} className="space-y-4 mt-4">
                            {formError && (
                                <div className="bg-red-50 p-3 rounded flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                                    <p className="text-red-700 text-sm">{formError}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={newTask.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter task description"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignee_id">Assign To *</Label>
                                <Select
                                    value={newTask.assignee_id}
                                    onValueChange={(value) => handleSelectChange('assignee_id', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={(value) => handleSelectChange('priority', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    name="due_date"
                                    type="date"
                                    value={newTask.due_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !newTask.title || !newTask.assignee_id}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Task'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {tasksError && (
                <div className="bg-red-50 p-4 rounded mb-4">
                    <p className="text-red-700">{tasksError}</p>
                </div>
            )}

            {isLoadingTasks && (
                <div className="text-center py-8">
                    <p>Loading team tasks...</p>
                </div>
            )}

            {!isLoadingTasks && teamTasks.length === 0 && !tasksError && (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">No tasks assigned to your team yet.</p>
                    <p className="text-gray-500 mt-1">Click "Assign New Task" to create one.</p>
                </div>
            )}

            {!isLoadingTasks && teamTasks.length > 0 && (
                <div className="space-y-4">
                    {teamTasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-lg">{task.title}</h4>
                                <div className="flex space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>

                            {task.description && (
                                <p className="text-gray-600 mb-3">{task.description}</p>
                            )}

                            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3">
                                {task.assignee && (
                                    <div className="flex items-center mr-4 mb-1">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>Assigned to: {task.assignee.full_name}</span>
                                    </div>
                                )}

                                {task.due_date && (
                                    <div className="flex items-center mr-4 mb-1">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>Due: {formatDate(task.due_date)}</span>
                                    </div>
                                )}

                                {task.completed_at && task.status === 'completed' && (
                                    <div className="flex items-center mr-4 mb-1">
                                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                                        <span>Completed: {formatDate(task.completed_at)}</span>
                                    </div>
                                )}

                                {/* Timeliness indicator */}
                                {(() => {
                                    const timeliness = getTimelinessInfo(task);
                                    return timeliness.text ? (
                                        <div className={`flex items-center mr-4 mb-1 ${timeliness.color}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                            <span className="italic">{timeliness.text}</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            <div className="flex space-x-2 mt-2">
                                {task.status === 'pending' && (
                                    <button
                                        onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                        disabled={updatingTaskId === task.id}
                                        className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                                    >
                                        <ArrowRightCircle className="h-4 w-4 mr-1" />
                                        Mark In Progress
                                    </button>
                                )}

                                {task.status === 'in-progress' && (
                                    <button
                                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                        disabled={updatingTaskId === task.id}
                                        className="flex items-center text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Mark Complete
                                    </button>
                                )}

                                {task.status === 'completed' && (
                                    <button
                                        onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                        disabled={updatingTaskId === task.id}
                                        className="flex items-center text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
                                    >
                                        <ArrowRightCircle className="h-4 w-4 mr-1" />
                                        Reopen Task
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SupervisorTasksTab;
