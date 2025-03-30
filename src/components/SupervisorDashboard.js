import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { getTaskProgress } from '../services/taskService';
import '../styles/SupervisorDashboard.css';
import '../styles/ProgressBar.css';

function SupervisorDashboard({ tasks: initialTasks, onStatusChange }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  useEffect(() => {
    console.log('Tasks updated from parent:', initialTasks);
    setTasks(initialTasks);
  }, [initialTasks]);

  const allTags = [...new Set(tasks.flatMap(task => task.tags))];

  const filteredTasks = tasks
    .filter(task => filterStatus === 'All' || task.status === filterStatus)
    .filter(task => filterPriority === 'All' || task.priority === filterPriority)
    .filter(task => filterTag === 'All' || task.tags.includes(filterTag))
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'deadlineAsc') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'deadlineDesc') return new Date(b.deadline) - new Date(a.deadline);
      return 0;
    });

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'High': return <span className="priority-high">🔼</span>;
      case 'Medium': return <span className="priority-medium">➖</span>;
      case 'Low': return <span className="priority-low">🔽</span>;
      default: return <span>—</span>;
    }
  };

  const logHistory = (taskId, action) => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          history: [
            ...task.history,
            { 
              id: task.history.length + 1, 
              action, 
              user: localStorage.getItem('email') || 'supervisor@test.com', 
              date: new Date().toISOString().split('T')[0] 
            },
          ],
        };
      }
      return task;
    });
  };

  const canChangeStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'Completed';
    });
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    if (!canChangeStatus(taskId) && newStatus !== 'Pending') {
      alert('Cannot change status: Dependencies not completed.');
      return;
    }
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      const loggedTasks = logHistory(taskId, `Status changed to ${newStatus}`);
      onStatusChange(taskId, newStatus);
      return loggedTasks;
    });
  };

  const getDeadlineStatus = (deadline, status) => {
    if (status === 'Completed') return { text: 'Done', className: 'deadline-completed' };
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Overdue ${Math.abs(diffDays)}d`, className: 'deadline-overdue' };
    if (diffDays === 0) return { text: 'Today', className: 'deadline-today' };
    return { text: `${diffDays}d`, className: 'deadline-upcoming' };
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkAction = () => {
    if (!bulkAction || !bulkValue || selectedTasks.length === 0) return;
    setTasks(prevTasks => {
      let updatedTasks = prevTasks;
      selectedTasks.forEach(taskId => {
        if (bulkAction === 'status' && canChangeStatus(taskId)) {
          updatedTasks = updatedTasks.map(task => 
            task.id === taskId ? { ...task, status: bulkValue } : task
          );
          updatedTasks = logHistory(taskId, `Status changed to ${bulkValue}`);
        }
      });
      onStatusChange(updatedTasks);
      return updatedTasks;
    });
    setSelectedTasks([]);
    setBulkAction('');
    setBulkValue('');
  };

  return (
    <div className="supervisor-dashboard">
      <h3>Supervisor Dashboard</h3>
      <div className="dashboard-controls">
        <label>
          Search:
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <label>
          Status:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <label>
          Priority:
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <label>
          Tag:
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
            <option value="All">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </label>
        <label>
          Sort:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="none">None</option>
            <option value="deadlineAsc">Earliest</option>
            <option value="deadlineDesc">Latest</option>
          </select>
        </label>
      </div>
      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <label>
            Action:
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Select</option>
              <option value="status">Change Status</option>
            </select>
          </label>
          {bulkAction === 'status' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
              <option value="">Select</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}
          <button onClick={handleBulkAction}>Apply</button>
          <button onClick={() => setSelectedTasks([])}>Clear</button>
        </div>
      )}
      <div className="task-grid">
        {filteredTasks.map(task => {
          const deadlineStatus = getDeadlineStatus(task.deadline, task.status);
          const isExpanded = expandedTaskId === task.id;
          return (
            <div key={task.id} className="task-card">
              <div 
                className="task-header" 
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => { e.stopPropagation(); handleSelectTask(task.id); }}
                />
                <div className="task-summary">
                  <h4>{task.title}</h4>
                  <div className="task-meta">
                    <span>{task.status}</span>
                    <span className={deadlineStatus.className}>{deadlineStatus.text}</span>
                    {getPriorityIndicator(task.priority)}
                  </div>
                </div>
                <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="task-details">
                  <p><strong>Assignee:</strong> {task.assignee}</p>
                  <p><strong>Deadline:</strong> {task.deadline}</p>
                  <div>
                    <strong>Status:</strong>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <ProgressBar 
                    progress={getTaskProgress(task.status)}
                    message={`${task.title}: ${task.description || 'No description'}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SupervisorDashboard;