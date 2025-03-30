import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { getTaskProgress } from '../services/taskService';
import TaskDependencyGraph from './TaskDependencyGraph';
import '../styles/TaskList.css';
import '../styles/ProgressBar.css';

function TaskList({ tasks: initialTasks, onStatusChange }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [commentTaskId, setCommentTaskId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [tagTaskId, setTagTaskId] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [historyTaskId, setHistoryTaskId] = useState(null);
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null); // New state for editing
  const [newTask, setNewTask] = useState({
    title: '', assignee: '', deadline: '', priority: 'Medium', tags: [], dependencies: [], status: 'Pending', comments: [], history: []
  });

  useEffect(() => {
    console.log('initialTasks updated from parent:', initialTasks);
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
    console.log('Logging history for Task:', taskId, 'Action:', action);
    return tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          history: [
            ...task.history,
            { 
              id: task.history.length + 1, 
              action, 
              user: localStorage.getItem('email') || 'user@test.com', 
              date: new Date().toISOString().split('T')[0] 
            },
          ],
        };
      }
      return task;
    });
  };

  const handleAddComment = (taskId) => {
    if (!newComment.trim()) return;
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [
              ...task.comments,
              { id: task.comments.length + 1, text: newComment, user: localStorage.getItem('email') || 'user@test.com', date: new Date().toISOString().split('T')[0] },
            ],
          };
        }
        return task;
      });
      console.log('Updated tasks with comment:', updatedTasks);
      onStatusChange(updatedTasks);
      return updatedTasks;
    });
    setNewComment('');
    setCommentTaskId(null);
  };

  const canChangeStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const canChange = task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'Completed';
    });
    console.log('Can change status for Task:', taskId, 'Result:', canChange, 'Dependencies:', task.dependencies);
    return canChange;
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    console.log('handleStatusUpdate called - Task:', taskId, 'New Status:', newStatus);
    if (!canChangeStatus(taskId) && newStatus !== 'Pending') {
      alert('Cannot change status: Dependencies not completed.');
      console.log('Blocked by dependencies');
      return;
    }
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          console.log('Updating Task:', taskId, 'from', task.status, 'to', newStatus);
          return { ...task, status: newStatus };
        }
        return task;
      });
      const loggedTasks = logHistory(taskId, `Status changed to ${newStatus}`);
      console.log('New tasks state after status update:', loggedTasks);
      onStatusChange(taskId, newStatus);
      return loggedTasks;
    });
  };

  const getDeadlineStatus = (deadline, status) => {
    if (status === 'Completed') return { text: 'Done', className: 'deadline-completed' };
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue ${Math.abs(diffDays)}d`, className: 'deadline-overdue' };
    if (diffDays === 0) return { text: 'Today', className: 'deadline-today' };
    return { text: `${diffDays}d`, className: 'deadline-upcoming' };
  };

  const handleAddTag = (taskId) => {
    if (!newTag.trim()) return;
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId && !task.tags.includes(newTag)) {
          return { ...task, tags: [...task.tags, newTag] };
        }
        return task;
      });
      const loggedTasks = logHistory(taskId, `Tag '${newTag}' added`);
      onStatusChange(loggedTasks);
      return loggedTasks;
    });
    setNewTag('');
  };

  const handleRemoveTag = (taskId, tag) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, tags: task.tags.filter(t => t !== tag) };
        }
        return task;
      });
      const loggedTasks = logHistory(taskId, `Tag '${tag}' removed`);
      onStatusChange(loggedTasks);
      return loggedTasks;
    });
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
        } else if (bulkAction === 'tag' && !updatedTasks.find(t => t.id === taskId).tags.includes(bulkValue)) {
          updatedTasks = updatedTasks.map(task => 
            task.id === taskId ? { ...task, tags: [...task.tags, bulkValue] } : task
          );
          updatedTasks = logHistory(taskId, `Tag '${bulkValue}' added`);
        }
      });
      onStatusChange(updatedTasks);
      return updatedTasks;
    });
    setSelectedTasks([]);
    setBulkAction('');
    setBulkValue('');
  };

  const getDependencyStatus = (task) => {
    if (task.dependencies.length === 0) return null;
    const uncompletedDeps = task.dependencies.filter(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'Completed';
    });
    if (uncompletedDeps.length > 0) {
      return `Waiting #${uncompletedDeps.join(', #')}`;
    }
    return 'Deps Met';
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignee || !newTask.deadline) {
      alert('Please fill in all required fields.');
      return;
    }
    if (editTaskId) {
      // Edit existing task
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
          task.id === editTaskId ? { ...task, ...newTask } : task
        );
        const loggedTasks = logHistory(editTaskId, 'Task details updated');
        console.log('Task edited:', updatedTasks);
        onStatusChange(loggedTasks);
        return loggedTasks;
      });
      setEditTaskId(null);
    } else {
      // Add new task
      const taskId = tasks.length + 1; // Simple ID; use UUID in production
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, { ...newTask, id: taskId }];
        console.log('New task added:', updatedTasks);
        onStatusChange(updatedTasks);
        return updatedTasks;
      });
    }
    setNewTask({ title: '', assignee: '', deadline: '', priority: 'Medium', tags: [], dependencies: [], status: 'Pending', comments: [], history: [] });
    setIsAddingTask(false);
  };

  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setNewTask({ ...task });
    setIsAddingTask(true);
  };

  return (
    <div className="task-list">
      <h3>Tasks</h3>
      <div className="task-add-section">
        <button onClick={() => setIsAddingTask(!isAddingTask)}>
          {isAddingTask ? 'Cancel' : 'Add Task'}
        </button>
        {isAddingTask && (
          <div className="task-form">
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Assignee"
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              multiple
              value={newTask.dependencies}
              onChange={(e) => {
                const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setNewTask({ ...newTask, dependencies: selectedIds });
              }}
              className="dependency-select"
            >
              {tasks
                .filter(task => task.id !== editTaskId) // Exclude the task being edited
                .map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} (#{task.id})
                  </option>
                ))}
            </select>
            <button onClick={handleAddTask}>{editTaskId ? 'Update Task' : 'Save Task'}</button>
          </div>
        )}
      </div>
      <div className="task-controls">
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
        <button onClick={() => setShowDependencyGraph(!showDependencyGraph)}>
          {showDependencyGraph ? 'Hide Dependencies' : 'Show Dependencies'}
        </button>
      </div>
      {showDependencyGraph && <TaskDependencyGraph tasks={tasks} />}
      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <label>
            Action:
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Select</option>
              <option value="status">Status</option>
              <option value="tag">Tag</option>
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
          {bulkAction === 'tag' && (
            <input
              type="text"
              placeholder="Tag..."
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
            />
          )}
          <button onClick={handleBulkAction}>Apply</button>
          <button onClick={() => setSelectedTasks([])}>Clear</button>
        </div>
      )}
      <div className="task-accordions">
        {filteredTasks.map((task) => {
          const deadlineStatus = getDeadlineStatus(task.deadline, task.status);
          const dependencyStatus = getDependencyStatus(task);
          const isExpanded = expandedTaskId === task.id;
          console.log('Rendering Task:', task.id, 'Status:', task.status);
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
                <button
                  className="edit-btn"
                  onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                >
                  ✎
                </button>
              </div>
              {isExpanded && (
                <div className="task-content">
                  <div className="content-grid">
                    <div className="details-column">
                      <div className="detail-item">
                        <span className="detail-label">👤 Assignee</span>
                        <span className="detail-value">{task.assignee}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Deadline</span>
                        <span className="detail-value">{task.deadline}</span>
                      </div>
                      {dependencyStatus && (
                        <div className="detail-item">
                          <span className="detail-label">🔗 Dependencies</span>
                          <span className={`detail-value ${dependencyStatus === 'Deps Met' ? 'dep-met' : 'dep-waiting'}`}>
                            {dependencyStatus}
                          </span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">📊 Progress</span>
                        <ProgressBar 
                          progress={getTaskProgress(task.status)}
                          message={`${task.title}: ${task.description}`}
                        />
                      </div>
                    </div>
                    <div className="interactive-column">
                      <div className="section-box">
                        <h5>⚙️ Status</h5>
                        <select
                          value={task.status}
                          onChange={(e) => {
                            console.log('Status dropdown changed to:', e.target.value);
                            handleStatusUpdate(task.id, e.target.value);
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div className="section-box">
                        <h5>🏷️ Tags</h5>
                        <div className="tags-container">
                          {task.tags.map(tag => (
                            <span key={tag} className="tag" style={{ backgroundColor: getTagColor(tag) }}>
                              {tag} <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(task.id, tag); }}>×</button>
                            </span>
                          ))}
                          <button 
                            className="add-tag-btn" 
                            onClick={(e) => { e.stopPropagation(); setTagTaskId(task.id === tagTaskId ? null : task.id); }}
                          >
                            {tagTaskId === task.id ? '−' : '+'}
                          </button>
                          {tagTaskId === task.id && (
                            <div className="tag-input">
                              <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                                placeholder="Add tag..."
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button onClick={(e) => { e.stopPropagation(); handleAddTag(task.id); }}>Add</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="section-box">
                        <h5>💬 Comments ({task.comments.length})</h5>
                        <button 
                          className="toggle-btn" 
                          onClick={(e) => { e.stopPropagation(); setCommentTaskId(task.id === commentTaskId ? null : task.id); }}
                        >
                          {commentTaskId === task.id ? 'Hide' : 'Show'}
                        </button>
                        {commentTaskId === task.id && (
                          <div className="comments-content">
                            {task.comments.length > 0 ? (
                              <ul>
                                {task.comments.map((comment) => (
                                  <li key={comment.id}>
                                    <strong>{comment.user}</strong> <span className="comment-date">({comment.date})</span>: {comment.text}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No comments yet.</p>
                            )}
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button onClick={(e) => { e.stopPropagation(); handleAddComment(task.id); }}>Post</button>
                          </div>
                        )}
                      </div>
                      <div className="section-box">
                        <h5>📜 History ({task.history.length})</h5>
                        <button 
                          className="toggle-btn" 
                          onClick={(e) => { e.stopPropagation(); setHistoryTaskId(task.id === historyTaskId ? null : task.id); }}
                        >
                          {historyTaskId === task.id ? 'Hide' : 'Show'}
                        </button>
                        {historyTaskId === task.id && (
                          <div className="history-content">
                            {task.history.length > 0 ? (
                              <ul>
                                {task.history.map((entry) => (
                                  <li key={entry.id}>
                                    <strong>{entry.user}</strong> <span className="history-date">({entry.date})</span>: {entry.action}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No history yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const getTagColor = (tag) => {
  const colors = {
    Sewing: '#AB47BC',
    QC: '#42A5F5',
    Packing: '#66BB6A',
    Urgent: '#EF5350',
  };
  return colors[tag] || '#B0BEC5';
};

export default TaskList;