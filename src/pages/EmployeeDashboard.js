import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import { mockTasks } from '../services/mockTasks';
import '../styles/EmployeeDashboard.css';

function EmployeeDashboard() {
  const [tasks, setTasks] = useState(mockTasks); // Initialize with mock data
  const [requestType, setRequestType] = useState('overtime');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');
  const [requests, setRequests] = useState([
    { id: 1, type: 'overtime', date: '2025-03-10', hours: '2h', status: 'approved' },
    { id: 2, type: 'leave', date: '2025-03-15', hours: 'Leave', status: 'pending' },
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
  // Handle request submission
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: requests.length + 1,
      type: requestType,
      date,
      hours: requestType === 'overtime' ? `${hours}h` : 'Leave',
      status: 'pending',
    };
    setRequests([...requests, newRequest]);
    setHours('');
    setDate('');
  };

  return (
    <div className="employee-dashboard">
      <h2>Your Tasks</h2>
      <TaskList tasks={tasks} onStatusChange={handleStatusChange} />
      <div className="request-form">
        <h3>Submit Request</h3>
        <form onSubmit={handleRequestSubmit}>
          <select value={requestType} onChange={(e) => setRequestType(e.target.value)}>
            <option value="overtime">Overtime</option>
            <option value="leave">Leave</option>
          </select>
          {requestType === 'overtime' && (
            <input
              type="number"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          )}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="request-status-list">
        <h3>Your Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Hours/Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.type}</td>
                <td>{req.date}</td>
                <td>{req.hours}</td>
                <td className={`status-${req.status}`}>{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeDashboard;