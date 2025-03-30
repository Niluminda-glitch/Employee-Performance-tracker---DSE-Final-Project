import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import { mockTasks } from '../services/mockTasks';
import '../styles/SupervisorDashboard.css';

function SupervisorDashboard() {
  const [tasks, setTasks] = useState(mockTasks); // Initialize with mock data
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '' });
  const [requests, setRequests] = useState([
    { id: 1, type: 'overtime', employee: 'employee@test.com', date: '2025-03-10', hours: '2h', status: 'pending' },
  ]);

  const handleStatusChange = (taskIdOrTasks, newStatus) => {
    if (Array.isArray(taskIdOrTasks)) {
      setTasks(taskIdOrTasks); // Handle updated tasks array from comments/tags
    } else {
      setTasks(tasks.map(task => 
        task.id === taskIdOrTasks ? { ...task, status: newStatus } : task
      ));
    }
  };
  // Handle new task assignment
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const task = { 
      ...newTask, 
      id: tasks.length + 1, 
      status: 'Pending', 
      priority: 'Medium', 
      description: 'New task assigned', // Default description
      comments: [] // Initialize comments
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', assignee: '', deadline: '' });
  };

  // Handle request approval/rejection
  const handleRequestAction = (reqId, action) => {
    setRequests(requests.map(req => 
      req.id === reqId ? { ...req, status: action } : req
    ));
  };

  return (
    <div className="supervisor-dashboard">
      <h2>Team Tasks</h2>
      <TaskList tasks={tasks} onStatusChange={handleStatusChange} />
      <div className="task-form">
        <h3>Assign New Task</h3>
        <form onSubmit={handleTaskSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Assignee Email"
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            required
          />
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            required
          />
          <button type="submit">Assign</button>
        </form>
      </div>
      <div className="request-approval">
        <h3>Pending Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Employee</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.type}</td>
                <td>{req.employee}</td>
                <td>{req.date}</td>
                <td>{req.hours}</td>
                <td>
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleRequestAction(req.id, 'approved')}>Approve</button>
                      <button onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</button>
                    </>
                  ) : (
                    <span className={`status-${req.status}`}>{req.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupervisorDashboard;